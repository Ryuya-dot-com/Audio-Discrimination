'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const ResultBundle = require(path.join(__dirname, '..', 'result_bundle.js'));
const decoder = new TextDecoder('utf-8', { fatal: true });

function readUint16(view, offset) {
    return view.getUint16(offset, true);
}

function readUint32(view, offset) {
    return view.getUint32(offset, true);
}

function independentCrc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit += 1) {
            crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
        }
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function parseStoreOnlyZip(bytes) {
    assert.ok(bytes instanceof Uint8Array, 'ZIP output must be Uint8Array');
    assert.ok(bytes.length >= 22, 'ZIP must contain an end record');
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const endOffset = bytes.length - 22;
    assert.equal(readUint32(view, endOffset), 0x06054b50, 'EOCD signature');
    assert.equal(readUint16(view, endOffset + 4), 0, 'single-disk ZIP');
    assert.equal(readUint16(view, endOffset + 6), 0, 'central directory is on disk zero');
    const entryCount = readUint16(view, endOffset + 10);
    assert.equal(readUint16(view, endOffset + 8), entryCount, 'entry counts agree');
    const centralSize = readUint32(view, endOffset + 12);
    const centralOffset = readUint32(view, endOffset + 16);
    assert.equal(centralOffset + centralSize, endOffset, 'central directory boundaries');
    assert.equal(readUint16(view, endOffset + 20), 0, 'ZIP comment is empty');

    const entries = new Map();
    let offset = centralOffset;
    for (let index = 0; index < entryCount; index += 1) {
        assert.equal(readUint32(view, offset), 0x02014b50, `central signature ${index + 1}`);
        const flags = readUint16(view, offset + 8);
        const method = readUint16(view, offset + 10);
        const expectedCrc = readUint32(view, offset + 16);
        const compressedSize = readUint32(view, offset + 20);
        const uncompressedSize = readUint32(view, offset + 24);
        const nameLength = readUint16(view, offset + 28);
        const extraLength = readUint16(view, offset + 30);
        const commentLength = readUint16(view, offset + 32);
        const localOffset = readUint32(view, offset + 42);
        const centralNameBytes = bytes.subarray(offset + 46, offset + 46 + nameLength);
        const filename = decoder.decode(centralNameBytes);

        assert.equal(flags & 0x0800, 0x0800, `${filename} has UTF-8 filename flag`);
        assert.equal(method, 0, `${filename} uses store-only method`);
        assert.equal(compressedSize, uncompressedSize, `${filename} is not compressed`);
        assert.equal(readUint32(view, localOffset), 0x04034b50, `${filename} local signature`);
        assert.equal(readUint16(view, localOffset + 6), flags, `${filename} flags agree`);
        assert.equal(readUint16(view, localOffset + 8), method, `${filename} methods agree`);
        assert.equal(readUint32(view, localOffset + 14), expectedCrc, `${filename} CRC fields agree`);
        assert.equal(readUint32(view, localOffset + 18), compressedSize, `${filename} sizes agree`);
        assert.equal(readUint32(view, localOffset + 22), uncompressedSize, `${filename} sizes agree`);
        const localNameLength = readUint16(view, localOffset + 26);
        const localExtraLength = readUint16(view, localOffset + 28);
        const localNameBytes = bytes.subarray(localOffset + 30, localOffset + 30 + localNameLength);
        assert.equal(decoder.decode(localNameBytes), filename, `${filename} names agree`);
        const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
        const content = bytes.slice(dataOffset, dataOffset + compressedSize);
        assert.equal(independentCrc32(content), expectedCrc, `${filename} CRC32 is correct`);
        entries.set(filename, content);
        offset += 46 + nameLength + extraLength + commentLength;
    }
    assert.equal(offset, centralOffset + centralSize, 'all central records parsed exactly');
    return entries;
}

async function main() {
    const expectedText = new Map([
        ['trial_results.csv', 'participant_code,response\nP001,高い\n'],
        ['結果.json', '{"status":"完了","note":"音声テスト 🎧"}\n'],
        ['metadata/README.txt', 'UTF-8 bundle\n']
    ]);
    const zip = ResultBundle.createZip(
        Array.from(expectedText, ([name, content]) => ({ name, content })),
        { modifiedAt: '2026-07-18T00:00:00Z' }
    );
    const parsed = parseStoreOnlyZip(zip);

    assert.deepEqual(Array.from(parsed.keys()), Array.from(expectedText.keys()), 'filenames and order');
    for (const [name, text] of expectedText) {
        assert.equal(decoder.decode(parsed.get(name)), text, `${name} UTF-8 content round-trips`);
    }
    assert.equal(ResultBundle.crc32('123456789'), 0xcbf43926, 'standard CRC32 vector');
    assert.throws(
        () => ResultBundle.createZip([{ name: '../escape.csv', content: 'no' }]),
        /Unsafe ZIP entry name/,
        'path traversal entry is rejected'
    );
    assert.throws(
        () => ResultBundle.createZip([['same.csv', 'a'], ['same.csv', 'b']]),
        /Duplicate ZIP entry name/,
        'duplicate entry names are rejected'
    );
    assert.equal(ResultBundle.sanitizeDownloadFilename('../結果?.zip'), '.._結果_.zip');

    const blob = ResultBundle.createZipBlob({ 'hello.txt': 'こんにちは' });
    assert.equal(blob.type, 'application/zip');
    assert.ok(blob.size > 22, 'ZIP Blob contains an archive');

    if (ResultBundle.isSha256Available()) {
        assert.equal(
            await ResultBundle.sha256Hex('abc'),
            'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
            'SHA-256 standard vector'
        );
    } else {
        assert.equal(await ResultBundle.sha256Hex('abc'), null, 'unavailable SHA-256 returns null');
    }

    console.log(`Result bundle ZIP verification passed (${parsed.size} UTF-8 files).`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

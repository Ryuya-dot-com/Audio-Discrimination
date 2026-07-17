(function attachResultBundle(root) {
    'use strict';

    const ZIP_LOCAL_FILE_SIGNATURE = 0x04034b50;
    const ZIP_CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
    const ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;
    const ZIP_VERSION = 20;
    const ZIP_UTF8_FLAG = 0x0800;
    const ZIP_STORE_METHOD = 0;
    const MAX_UINT16 = 0xffff;
    const MAX_UINT32 = 0xffffffff;
    const DEFAULT_MODIFIED_AT = new Date(Date.UTC(1980, 0, 1, 0, 0, 0));

    let utf8Encoder = null;
    let crcTable = null;

    function encodeUtf8(value) {
        if (typeof root.TextEncoder !== 'function') {
            throw new Error('This browser does not provide TextEncoder.');
        }
        if (!utf8Encoder) {
            utf8Encoder = new root.TextEncoder();
        }
        return utf8Encoder.encode(String(value));
    }

    function toBytes(value, label) {
        if (typeof value === 'string') {
            return encodeUtf8(value);
        }
        if (value instanceof Uint8Array) {
            return new Uint8Array(value);
        }
        if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
            return new Uint8Array(value.slice(0));
        }
        if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(value)) {
            return new Uint8Array(value.buffer.slice(
                value.byteOffset,
                value.byteOffset + value.byteLength
            ));
        }
        throw new TypeError(`${label} must be a string, Uint8Array, ArrayBuffer, or typed-array view.`);
    }

    function getCrcTable() {
        if (crcTable) {
            return crcTable;
        }
        crcTable = new Uint32Array(256);
        for (let index = 0; index < 256; index += 1) {
            let value = index;
            for (let bit = 0; bit < 8; bit += 1) {
                value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
            }
            crcTable[index] = value >>> 0;
        }
        return crcTable;
    }

    function crc32(value) {
        const bytes = toBytes(value, 'CRC32 input');
        const table = getCrcTable();
        let crc = 0xffffffff;
        for (let index = 0; index < bytes.length; index += 1) {
            crc = (crc >>> 8) ^ table[(crc ^ bytes[index]) & 0xff];
        }
        return (crc ^ 0xffffffff) >>> 0;
    }

    function normalizeEntryName(value) {
        let name = String(value);
        if (typeof name.normalize === 'function') {
            name = name.normalize('NFC');
        }
        if (!name || name.length > 1024) {
            throw new RangeError('ZIP entry names must contain between 1 and 1024 characters.');
        }
        if (/^[\/]/.test(name) || /\\/.test(name) || /[\u0000-\u001f\u007f]/.test(name)) {
            throw new Error(`Unsafe ZIP entry name: ${name}`);
        }
        const segments = name.split('/');
        if (segments.some((segment) => !segment || segment === '.' || segment === '..')) {
            throw new Error(`Unsafe ZIP entry name: ${name}`);
        }
        return name;
    }

    function normalizeFileInputs(files) {
        let rawEntries;
        if (files instanceof Map) {
            rawEntries = Array.from(files.entries()).map(([name, content]) => ({ name, content }));
        } else if (Array.isArray(files)) {
            rawEntries = files.map((entry) => {
                if (Array.isArray(entry) && entry.length === 2) {
                    return { name: entry[0], content: entry[1] };
                }
                return entry;
            });
        } else if (files && typeof files === 'object') {
            rawEntries = Object.keys(files).map((name) => ({ name, content: files[name] }));
        } else {
            throw new TypeError('ZIP files must be an array, Map, or filename-to-content object.');
        }

        if (rawEntries.length > MAX_UINT16) {
            throw new RangeError('ZIP32 archives cannot contain more than 65,535 files.');
        }

        const seenNames = new Set();
        return rawEntries.map((entry, index) => {
            if (!entry || typeof entry !== 'object' || !Object.prototype.hasOwnProperty.call(entry, 'name')) {
                throw new TypeError(`ZIP file entry ${index + 1} must include a name.`);
            }
            const name = normalizeEntryName(entry.name);
            if (seenNames.has(name)) {
                throw new Error(`Duplicate ZIP entry name: ${name}`);
            }
            seenNames.add(name);

            const contentKey = Object.prototype.hasOwnProperty.call(entry, 'content') ? 'content' : 'data';
            if (!Object.prototype.hasOwnProperty.call(entry, contentKey)) {
                throw new TypeError(`ZIP file entry ${name} must include content or data.`);
            }
            const data = toBytes(entry[contentKey], `Content for ${name}`);
            const nameBytes = encodeUtf8(name);
            if (nameBytes.length > MAX_UINT16) {
                throw new RangeError(`UTF-8 ZIP entry name is too long: ${name}`);
            }
            if (data.length > MAX_UINT32) {
                throw new RangeError(`ZIP32 file is too large: ${name}`);
            }
            return {
                name,
                nameBytes,
                data,
                crc: crc32(data),
                modifiedAt: entry.modifiedAt
            };
        });
    }

    function toDosDateTime(value) {
        const date = value === undefined || value === null ? DEFAULT_MODIFIED_AT : new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new RangeError('ZIP modifiedAt must be a valid date.');
        }
        const year = Math.min(2107, Math.max(1980, date.getUTCFullYear()));
        const month = year === 1980 && date.getUTCFullYear() < 1980 ? 1 : date.getUTCMonth() + 1;
        const day = year === 1980 && date.getUTCFullYear() < 1980 ? 1 : date.getUTCDate();
        const hours = year === 1980 && date.getUTCFullYear() < 1980 ? 0 : date.getUTCHours();
        const minutes = year === 1980 && date.getUTCFullYear() < 1980 ? 0 : date.getUTCMinutes();
        const seconds = year === 1980 && date.getUTCFullYear() < 1980 ? 0 : date.getUTCSeconds();
        return {
            date: ((year - 1980) << 9) | (month << 5) | day,
            time: (hours << 11) | (minutes << 5) | Math.floor(seconds / 2)
        };
    }

    function writeUint16(view, offset, value) {
        view.setUint16(offset, value, true);
    }

    function writeUint32(view, offset, value) {
        view.setUint32(offset, value >>> 0, true);
    }

    function createZip(files, options) {
        const entries = normalizeFileInputs(files);
        const settings = options || {};
        let localDirectorySize = 0;
        let centralDirectorySize = 0;

        entries.forEach((entry) => {
            entry.localOffset = localDirectorySize;
            entry.dos = toDosDateTime(entry.modifiedAt === undefined ? settings.modifiedAt : entry.modifiedAt);
            localDirectorySize += 30 + entry.nameBytes.length + entry.data.length;
            centralDirectorySize += 46 + entry.nameBytes.length;
            if (localDirectorySize > MAX_UINT32) {
                throw new RangeError('ZIP32 local file area exceeds 4 GiB.');
            }
        });
        if (centralDirectorySize > MAX_UINT32) {
            throw new RangeError('ZIP32 central directory exceeds 4 GiB.');
        }
        const totalSize = localDirectorySize + centralDirectorySize + 22;
        if (totalSize > MAX_UINT32) {
            throw new RangeError('ZIP32 archive exceeds 4 GiB.');
        }

        const archive = new Uint8Array(totalSize);
        const view = new DataView(archive.buffer);
        let offset = 0;

        entries.forEach((entry) => {
            writeUint32(view, offset, ZIP_LOCAL_FILE_SIGNATURE);
            writeUint16(view, offset + 4, ZIP_VERSION);
            writeUint16(view, offset + 6, ZIP_UTF8_FLAG);
            writeUint16(view, offset + 8, ZIP_STORE_METHOD);
            writeUint16(view, offset + 10, entry.dos.time);
            writeUint16(view, offset + 12, entry.dos.date);
            writeUint32(view, offset + 14, entry.crc);
            writeUint32(view, offset + 18, entry.data.length);
            writeUint32(view, offset + 22, entry.data.length);
            writeUint16(view, offset + 26, entry.nameBytes.length);
            writeUint16(view, offset + 28, 0);
            archive.set(entry.nameBytes, offset + 30);
            archive.set(entry.data, offset + 30 + entry.nameBytes.length);
            offset += 30 + entry.nameBytes.length + entry.data.length;
        });

        const centralDirectoryOffset = offset;
        entries.forEach((entry) => {
            writeUint32(view, offset, ZIP_CENTRAL_DIRECTORY_SIGNATURE);
            writeUint16(view, offset + 4, ZIP_VERSION);
            writeUint16(view, offset + 6, ZIP_VERSION);
            writeUint16(view, offset + 8, ZIP_UTF8_FLAG);
            writeUint16(view, offset + 10, ZIP_STORE_METHOD);
            writeUint16(view, offset + 12, entry.dos.time);
            writeUint16(view, offset + 14, entry.dos.date);
            writeUint32(view, offset + 16, entry.crc);
            writeUint32(view, offset + 20, entry.data.length);
            writeUint32(view, offset + 24, entry.data.length);
            writeUint16(view, offset + 28, entry.nameBytes.length);
            writeUint16(view, offset + 30, 0);
            writeUint16(view, offset + 32, 0);
            writeUint16(view, offset + 34, 0);
            writeUint16(view, offset + 36, 0);
            writeUint32(view, offset + 38, 0);
            writeUint32(view, offset + 42, entry.localOffset);
            archive.set(entry.nameBytes, offset + 46);
            offset += 46 + entry.nameBytes.length;
        });

        writeUint32(view, offset, ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE);
        writeUint16(view, offset + 4, 0);
        writeUint16(view, offset + 6, 0);
        writeUint16(view, offset + 8, entries.length);
        writeUint16(view, offset + 10, entries.length);
        writeUint32(view, offset + 12, centralDirectorySize);
        writeUint32(view, offset + 16, centralDirectoryOffset);
        writeUint16(view, offset + 20, 0);
        return archive;
    }

    function createZipBlob(files, options) {
        if (typeof root.Blob !== 'function') {
            throw new Error('This browser does not provide Blob.');
        }
        return new root.Blob([createZip(files, options)], { type: 'application/zip' });
    }

    function isSha256Available() {
        return Boolean(root.crypto && root.crypto.subtle && typeof root.crypto.subtle.digest === 'function');
    }

    async function sha256Hex(value) {
        if (!isSha256Available()) {
            return null;
        }
        let bytes;
        if (typeof root.Blob === 'function' && value instanceof root.Blob) {
            bytes = new Uint8Array(await value.arrayBuffer());
        } else {
            bytes = toBytes(value, 'SHA-256 input');
        }
        const digest = await root.crypto.subtle.digest('SHA-256', bytes);
        return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
    }

    function sanitizeDownloadFilename(value) {
        let filename = String(value === undefined || value === null ? '' : value);
        if (typeof filename.normalize === 'function') {
            filename = filename.normalize('NFC');
        }
        filename = filename
            .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, '_')
            .replace(/[. ]+$/g, '')
            .trim();
        if (!filename || filename === '.' || filename === '..') {
            filename = 'download';
        }
        return Array.from(filename).slice(0, 180).join('');
    }

    function downloadBlob(blob, filename) {
        if (typeof root.Blob !== 'function' || !(blob instanceof root.Blob)) {
            throw new TypeError('downloadBlob requires a Blob.');
        }
        if (!root.document || !root.URL || typeof root.URL.createObjectURL !== 'function') {
            throw new Error('Blob downloads require a browser document and URL.createObjectURL.');
        }
        const safeFilename = sanitizeDownloadFilename(filename);
        const objectUrl = root.URL.createObjectURL(blob);
        const anchor = root.document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = safeFilename;
        anchor.rel = 'noopener';
        anchor.style.display = 'none';
        const parent = root.document.body || root.document.documentElement;
        parent.appendChild(anchor);
        try {
            anchor.click();
        } catch (error) {
            root.URL.revokeObjectURL(objectUrl);
            throw error;
        } finally {
            anchor.remove();
        }
        root.setTimeout(() => root.URL.revokeObjectURL(objectUrl), 1000);
        return safeFilename;
    }

    const api = Object.freeze({
        createZip,
        createZipBlob,
        crc32,
        downloadBlob,
        encodeUtf8,
        isSha256Available,
        sanitizeDownloadFilename,
        sha256Hex
    });

    root.ResultBundle = api;
    if (typeof module === 'object' && module && module.exports) {
        module.exports = api;
    }
}(typeof globalThis !== 'undefined' ? globalThis : window));

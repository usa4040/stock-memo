/**
 * CSV -> Prisma upsert バッチシードスクリプト
 *
 * 前提:
 * - CSV は UTF-8 エンコーディング (shift_jis の場合は事前に iconv 等で変換してください)
 * - CSV のヘッダーは "日付","コード","銘柄名","市場・商品区分","33業種コード","33業種区分","17業種コード","17業種区分","規模コード","規模区分" 等を含む
 * - prisma client はプロジェクトルート/lib/prisma.ts で export default prisma していること
 *
 * 使い方:
 * 1. data/stock.csv を配置
 * 2. npx ts-node scripts/seed-stock-from-csv-batch.ts
 *
 * 挙動:
 * - BATCH_SIZE ごとに分割して逐次 upsert を行う（DB への突発負荷を抑える）
 * - エラー行は tmp/failed-row-<code or index>.json に保存して処理継続
 * - tmp/ を .gitignore に追加することを推奨
 */

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import prisma from '../lib/prisma';

const CSV_PATH = path.resolve(process.cwd(), 'data', 'stock.csv');
const BATCH_SIZE = 200; // 推奨: 200（4411行なら約23バッチ）
const TMP_DIR = path.resolve(process.cwd(), 'tmp');

function parseDateYYYYMMDD(s?: string): Date | null {
    if (!s) return null;
    const str = String(s).trim();
    if (!/^\d{8}$/.test(str)) return null;
    const yyyy = str.slice(0, 4);
    const mm = str.slice(4, 6);
    const dd = str.slice(6, 8);
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
}

async function readCsvRows(): Promise<Record<string, string>[]> {
    if (!fs.existsSync(CSV_PATH)) {
        throw new Error(`CSV not found at ${CSV_PATH}`);
    }

    return new Promise((resolve, reject) => {
        const rows: Record<string, string>[] = [];
        fs.createReadStream(CSV_PATH)
            .pipe(csv({ skipLines: 0 }))
            .on('data', (row) => rows.push(row))
            .on('end', () => resolve(rows))
            .on('error', (err) => reject(err));
    });
}

async function upsertBatchSequential(rows: Record<string, string>[]) {
    let succeeded = 0;
    for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        // コード (主キー) を取得
        const codeRaw = (r['コード'] ?? r['code'] ?? '').toString().trim();
        const code = codeRaw || '';
        if (!code) {
            console.warn(`Skipping row ${i} in batch: empty code`);
            const failPath = path.resolve(TMP_DIR, `failed-row-emptycode-${Date.now()}-${i}.json`);
            fs.mkdirSync(path.dirname(failPath), { recursive: true });
            fs.writeFileSync(failPath, JSON.stringify({ row: r, reason: 'empty code' }, null, 2));
            continue;
        }

        const name = (r['銘柄名'] ?? r['name'] ?? '').toString().trim();
        const marketSegment = (r['市場・商品区分'] ?? r['market'] ?? '').toString().trim() || null;
        const industry33Code = (r['33業種コード'] ?? '').toString().trim() || null;
        const industry33Name = (r['33業種区分'] ?? '').toString().trim() || null;
        const industry17Code = (r['17業種コード'] ?? '').toString().trim() || null;
        const industry17Name = (r['17業種区分'] ?? '').toString().trim() || null;
        const scaleCode = (r['規模コード'] ?? '').toString().trim() || null;
        const scaleName = (r['規模区分'] ?? '').toString().trim() || null;
        const listedDate = parseDateYYYYMMDD(r['日付'] ?? r['listed_date']);
        const rawCsv = r;

        try {
            await prisma.stock.upsert({
                where: { code },
                create: {
                    code,
                    name,
                    marketSegment,
                    industry33Code,
                    industry33Name,
                    industry17Code,
                    industry17Name,
                    scaleCode,
                    scaleName,
                    listedDate,
                    rawCsv,
                },
                update: {
                    name,
                    marketSegment,
                    industry33Code,
                    industry33Name,
                    industry17Code,
                    industry17Name,
                    scaleCode,
                    scaleName,
                    listedDate,
                    rawCsv,
                },
            });
            succeeded++;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(`Upsert error for code=${code} (row index in batch=${i}):`, errorMessage);
            try {
                const failPath = path.resolve(TMP_DIR, `failed-row-${code || 'idx' + i}-${Date.now()}.json`);
                fs.mkdirSync(path.dirname(failPath), { recursive: true });
                fs.writeFileSync(failPath, JSON.stringify({ row: r, error: String(err) }, null, 2));
                console.error(`Wrote failed row to ${failPath}`);
            } catch (writeErr) {
                console.error('Failed to write failed-row file:', writeErr);
            }
        }
    }
    return { succeeded, total: rows.length };
}

async function main() {
    console.log('Starting stock CSV seed');
    try {
        // tmp ディレクトリを作成（失敗ログ用）
        fs.mkdirSync(TMP_DIR, { recursive: true });

        // CSV 読み込み
        console.log(`Reading CSV from ${CSV_PATH} ...`);
        const rows = await readCsvRows();
        console.log(`Total rows read: ${rows.length}`);

        if (rows.length === 0) {
            console.warn('No rows found in CSV. Exiting.');
            process.exit(0);
        }

        // バッチで処理
        let processed = 0;
        let totalSucceeded = 0;
        const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

        for (let b = 0; b < totalBatches; b++) {
            const start = b * BATCH_SIZE;
            const end = Math.min(start + BATCH_SIZE, rows.length);
            const batch = rows.slice(start, end);
            console.log(`Processing batch ${b + 1}/${totalBatches} (rows ${start}..${end - 1}, ${batch.length} rows) ...`);

            const result = await upsertBatchSequential(batch);
            processed += batch.length;
            totalSucceeded += result.succeeded;

            console.log(`Batch ${b + 1} finished: succeeded ${result.succeeded}/${result.total}. Processed ${processed}/${rows.length}`);
        }

        console.log(`All batches done. Total succeeded: ${totalSucceeded}/${rows.length}`);

        // 切断
        await prisma.$disconnect();
        console.log('Prisma disconnected. Done.');
        process.exit(0);
    } catch (err) {
        console.error('Fatal error in seeding:', err);
        try {
            await prisma.$disconnect();
        } catch { /* empty */ }
        process.exit(1);
    }
}

main();

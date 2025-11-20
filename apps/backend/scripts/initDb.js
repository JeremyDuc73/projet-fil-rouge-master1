import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import pool from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runSQL = async (filepath) => {
    const sql = readFileSync(filepath, 'utf-8');
    await pool.query(sql);
};

const runImportTMDB = (clearFirst = false) => {
    return new Promise((resolve, reject) => {
        const args = ['scripts/importTMDB.js'];
        if (clearFirst) args.push('--clear');
        
        const child = spawn('node', args, { 
            cwd: join(__dirname, '..'),
            stdio: 'inherit'
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Import TMDB failed with code ${code}`));
            }
        });
    });
};

const init = async () => {
    try {
        // Parse arguments
        const args = process.argv.slice(2);
        const useTMDB = args.includes('--tmdb');
        const clearData = args.includes('--clear') || args.includes('-c');
        
        console.log('[INFO] Initialisation de la base de données...');
        
        await pool.query('SELECT NOW()');
        console.log('[SUCCESS] Connexion à PostgreSQL établie');

        console.log('[INFO] Création des tables...');
        await runSQL(join(__dirname, '../database/schema.sql'));
        console.log('[SUCCESS] Tables créées');

        console.log('[INFO] Insertion des catégories et utilisateurs...');
        await runSQL(join(__dirname, '../database/seed.sql'));
        console.log('[SUCCESS] Données de base insérées');

        // Import from TMDB if requested
        if (useTMDB) {
            console.log('\n[INFO] Import des films depuis TMDB...');
            await runImportTMDB(clearData);
        } else {
            console.log('\n[INFO] Mode standard (pas d\'import TMDB)');
            console.log('[TIP] Utilisez --tmdb pour importer depuis TMDB');
            console.log('[TIP] Utilisez --tmdb --clear pour remplacer les films existants');
        }

        console.log('\n[SUCCESS] Base de données initialisée avec succès !');
        process.exit(0);
    } catch (error) {
        console.error('[ERROR] Erreur lors de l\'initialisation :', error.message);
        process.exit(1);
    }
};

init();

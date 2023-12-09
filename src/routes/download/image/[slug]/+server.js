import { createConnection } from 'mysql2';
import {DB_URL} from '$env/static/private'
import { send } from 'vite';

export async function GET({ request, params }) {
    const cid=params.slug


    const con = createConnection({
        host: DB_URL,
        user: 'root',
        password: 'l',
        database: 'messaging_app',
    })
    const file = await con.promise().execute("SELECT File,Name FROM Documents WHERE CId=(?)",[cid]);
    let buf = await file[0][0].File
    // buf = new TextDecoder().decode(buf);
    con.end();
    return new Response(buf,{
        headers: {
        'Content-Type': 'image/jpeg',
        },
    });
}
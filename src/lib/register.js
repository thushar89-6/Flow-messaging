import { createConnection  } from 'mysql2';
import {DB_URL} from '$env/static/private'

export let register = async (username,email,password,regdate)=> {
    try{
        const con = createConnection({
            host: DB_URL,
            user: 'root',
            password: 'l',
            database: 'messaging_app',
        })
        con.query("INSERT IGNORE INTO User (Username,UserEmail,EmailPassword,RegDate) values (?,?,?,?)",[username,email,password,regdate]);
        con.end();
        return 0;
    }catch(err){
        console.log("Insert failed");
        return -1;
    };
}



import { createConnection } from "mysql2";
import {DB_URL} from '$env/static/private'

export let getuserdetails = async(sessionid)=> {
    const con = createConnection({
        host: DB_URL,
        user: 'root',
        password: 'l',
        database: 'messaging_app',
    })
    const result = await con.promise().execute("SELECT * from Session where SessionId=(?)",[sessionid]).then((res)=>{
        return res[0][0];
    });
    const final = await con.promise().execute("SELECT * from User where UserEmail=(?)",[result.UserEmail]).then((res)=>{
        return res[0][0];
    });
    con.end();
    return final;
}

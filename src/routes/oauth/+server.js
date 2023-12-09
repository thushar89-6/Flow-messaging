import { redirect } from "@sveltejs/kit";
import { OAuth2Client } from "google-auth-library";
import {SECRET_CLIENT_ID,SECRET_CLIENT_SECRET} from "$env/static/private"
import { createsession } from "../../lib/createsession";
import { register } from '../../lib/register';
import { v4 as uuidv4 } from 'uuid';
import { createConnection } from "mysql2";
import fs from 'fs';
import {DB_URL} from '$env/static/private';


export const GET = async ({url,cookies}) => {
    const redirecturl = 'https://chat.skapi.online/oauth';
    const code = await url.searchParams.get('code');
    console.log('returned code',code);

    try{
        const oauthclient = new OAuth2Client(SECRET_CLIENT_ID,SECRET_CLIENT_SECRET,redirecturl);
        const r = await oauthclient.getToken(code);
        oauthclient.setCredentials(r.tokens);
        const userInfo = await oauthclient.request({
            url: 'https://www.googleapis.com/oauth2/v3/userinfo ',
          });
        const {name,email} = userInfo.data;
          console.log(name,email)
        await register(name,email,uuidv4(),new Date().toISOString().slice(0, 19).replace('T', ' '));

        const dp = fs.readFileSync('static/profile.jpg')
        const con = createConnection({
          host: DB_URL,
          user: 'root',
          password: 'l',
          database: 'messaging_app',
        })
        await con.promise().execute("INSERT IGNORE INTO Profilepicture (Email,Picture) values (?,?)",[email,dp]);
        con.end();


        const sessionid = await createsession(email);
	      console.log("created session for",email);
          cookies.set("access","true",{ maxAge : 604800,httpOnly: true,secure:true});
          cookies.set("session",sessionid,{ maxAge : 604800,httpOnly: true,secure: true})
          throw redirect(303,"/");
        
    }catch(err){
        console.log(err);
    }




    throw redirect(307,"/");
}

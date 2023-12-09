import { fail, redirect } from "@sveltejs/kit";
import { verifyuser } from "$lib/verify";
import { createsession } from "$lib/createsession";
import { RECAPTCHA_SECRET } from "$env/static/private"
import {SECRET_CLIENT_ID,SECRET_CLIENT_SECRET} from "$env/static/private"
import { OAuth2Client } from 'google-auth-library';


export const actions = {   
    login: async ({request, cookies}) => {
        let data = await request.formData();
        console.log(data)

        if (!data.get("email")){
            return fail(400,{
                    success: false,
                    message: "Please enter email"
                });
        }

        if(data.get("g-recaptcha-response")==""){
            return fail(400,{
                success: false,
                message: "Please attempt captcha"
            });
        }

        const options = {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${RECAPTCHA_SECRET}&response=${data.get('g-recaptcha-response')}`
        };

        let captcha_ver_response = await fetch( 'https://www.google.com/recaptcha/api/siteverify', options );
        captcha_ver_response = await captcha_ver_response.json();
        console.log(captcha_ver_response)

        if(captcha_ver_response.success==false){
            console.log('here')
            return fail(400,{ 
                success: false,
                message: "Captcha is failed, please attempt again." 
            });
        }                // Do something with response.


        if (await verifyuser(data.get("email"),data.get("password"))){
            const sessionid = await createsession(data.get("email"));
            cookies.set("access","true",{ maxAge : 604800,httpOnly: true,secure:true});
            cookies.set("session",sessionid,{ maxAge : 604800,httpOnly: true,secure: true})
            throw redirect(303,"/");
        }
        else{
            return fail(400,{ 
                message: "Please enter valid details" 
            });
        }
    },
    oauth: async ({request})=>{
        const redirecturl="https://chat.skapi.online/oauth"
        const oauthclient = new OAuth2Client(SECRET_CLIENT_ID,SECRET_CLIENT_SECRET,redirecturl);
        const authoriseurl = oauthclient.generateAuthUrl({
          access_type: 'offline',
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
          prompt: 'consent'
        });

	throw redirect(302,authoriseurl);
      }    
};

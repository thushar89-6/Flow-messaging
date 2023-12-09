import { fail, redirect } from '@sveltejs/kit';
import { createConnection } from 'mysql2';
import { getuserdetails } from '../lib/getuserfromsession';
import {DB_URL} from '$env/static/private'

export const load = async({ request, cookies }) => {
	if (!cookies.get("access")) {
		throw redirect(307, '/login');
	}else{

		
		const con = createConnection({
			host: DB_URL,
			user: 'root',
			password: 'l',
			database: 'messaging_app',
		})
		const res = await getuserdetails(cookies.get("session"))
		const r4 = await con.promise().execute("SELECT Receiver from Hadconversationswith where Sender=(?)",[res.UserEmail]).then((res)=>{return res[0]});
		con.end();
		return {
			res,
			convlist: r4
		}
	}
}

export const actions = {
	adduser: async({request,cookies}) => {
		const con = createConnection({
			host: DB_URL,
			user: 'root',
			password: 'l',
			database: 'messaging_app',
		})
		const userfrom = await con.promise().execute("SELECT UserEmail FROM Session WHERE SessionId=(?)",[cookies.get("session")]).then((res)=>{return res[0][0].UserEmail})
		const r2 = await request.formData();
		const userto = r2.get("adduser");
		if (userfrom==userto) return;
		try{
				await con.promise().execute("INSERT IGNORE INTO Hadconversationswith VALUES (?,?)",[userfrom,userto]);
				await con.promise().execute("INSERT IGNORE INTO Hadconversationswith VALUES (?,?)",[userto,userfrom]);

			
			const convs= await con.promise().execute("SELECT Receiver FROM Hadconversationswith WHERE Sender=(?)",[userfrom]).then((res)=>{return res[0]});
			return {
				success: true,
				convlist: convs
			}
		}catch(e){
			console.log(e);
			return fail(400,{
				success: false,
				message: "User does not exist"
			});
		}finally{
			con.end();
		}
		
	},
	message: async({request,cookies}) => {
		const t = await request.formData();
		const message = t.get("message");
		console.log("RECEIIIIIIIIIIIIIIVED ",message)
		const receiver = t.get("receiver");
		const t1 = await getuserdetails(cookies.get("session"));
		console.log(t1,'t1')
		const sender = t1.UserEmail;
		const con = createConnection({
			host: DB_URL,
			user: 'root',
			password: 'l',
			database: 'messaging_app',
		})
		await con.promise().execute("INSERT INTO Conversation (Sender,Receiver,Timestamp,Message) values (?,?,?,?)",[sender,receiver,new Date().toISOString().slice(0, 19).replace('T', ' '),message]);
		con.end();
		return {
			status:"sent",
			message:message,
			receiver:receiver
		};
	},
	removeuser: async({request,cookies}) => {
		const con = createConnection({
			host: DB_URL,
			user: 'root',
			password: 'l',
			database: 'messaging_app',
		})
		const r = await request.formData();
		const userto = r.get("user");
		if (userto=="") return;
		const userfrom = await con.promise().execute("SELECT UserEmail FROM Session WHERE SessionId=(?)",[cookies.get("session")]).then((res)=>{return res[0][0].UserEmail})
		console.log(userto,userfrom)
		await con.promise().execute("DELETE FROM Hadconversationswith WHERE Sender=(?) AND Receiver=(?)",[userfrom,userto]);
		con.end();

	},
	document: async({request,cookies}) => {
		const data = await request.formData();
		const file = data.get("file")
		const receiver=data.get("receiver")
		const con = createConnection({
			host: DB_URL,
			user: 'root',
			password: 'l',
			database: 'messaging_app',
		})
		const sender = await con.promise().execute("SELECT UserEmail FROM Session WHERE SessionId=(?)",[cookies.get("session")]).then((res)=>{return res[0][0].UserEmail})
		let name="Document: "+file.name;
		await con.promise().execute("INSERT INTO Conversation (Sender,Receiver,Timestamp,Message) values (?,?,?,?)",[sender,receiver,new Date().toISOString().slice(0, 19).replace('T', ' '),name]);
		
		const count = await con.promise().execute("select count(*) as count from Conversation");

		let filedata = await file.arrayBuffer();
		// filedata = new TextEncoder().encode(filedata)

		await con.promise().execute("INSERT INTO Documents (CId, File, Name) values (?,?,?)",[count[0][0].count,filedata,file.name]);
		con.end();
	    // writeFile(`./documents/${file.name}`,await file.stream());



		
	}
};
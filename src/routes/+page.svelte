<script>
	import { enhance } from "$app/forms";
	import { onMount } from "svelte";
	import { PUBLIC_WS_URL } from "$env/static/public"
	export let data;
	export let form;
	let ws;
	let conversation;
	let sender = data.res.UserEmail;
	let receiver;
	let mobileview=false;
	let onlineusers;
	let scrollable;
	let inputfile;
	let filesubmit;
	onMount(()=>{
		ws = new WebSocket(PUBLIC_WS_URL);
		ws.onmessage = (event) => {
      	let d = JSON.parse(event.data);
		if (d?.type=="online"){
			onlineusers=d.data;
		}
		else{
			conversation = d;
		}
		
    };


});
const scrollToBottom = async (node) => {
    node.scroll({ bottom: node.scrollHeight, behavior: 'smooth' });
  }; 


let func4 = (e) => {
		mobileview=!mobileview;
		

	}
	let wsfunc = () => {
		ws.send("on")
	}
	$: data.convlist = form?.convlist ? form.convlist : data.convlist;
</script>
<div class="body-container" >
	<div class="sidebar">
	    
		<div class="input-container" style="padding:10px; padding-left:28px; display:inline-block">
				<form method="post" use:enhance action="?/adduser">
					<input type="text" class="modern-input" placeholder="Add users..." name=adduser>
				</form>
		</div>	
		<div class="conversations" style="padding: 10px;">
			{#each data?.convlist || [] as obj}
				<div class="chat-list" class:selected={receiver == obj.Receiver}>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div class="chat-item" on:click={()=>{
						receiver=obj.Receiver;
						ws.send(JSON.stringify({receiver,sender}));
					}
					} >
					  <div class="user-avatar">
						<img style="border-radius: 30px; border:#007bff 1px solid" src={`/download/profile/${obj.Receiver}`} height=50px width=50px>
					  </div>
					  <div class="user-info">
						<p class="user-name" style="padding-left:10px">{obj.Receiver}</p>
						<p style="padding-left:10px" class:online={onlineusers?.includes(obj.Receiver)} class:offline={!(onlineusers?.includes(obj.Receiver))}>{onlineusers?.includes(obj.Receiver)?"Online":"Offline"}</p>
					  </div>
					</div>
				</div>
			{/each}
		</div>		
	</div>
	<div class="mobile" class:mobilemenu={mobileview} class:mobilemenuhidden={mobileview}>
		<div class="msidebar">
			<div class="input-container" style="padding:10px; width:100%">
				<form method="post" use:enhance action="?/adduser">
					<input type="text" style="width:100%" class="modern-input" placeholder="Add users..." name=adduser>
				</form>
			</div>	
			<div class="conversations" style="padding: 10px">
	
				{#each data?.convlist || [] as obj}
					<div class="chat-list" >
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div class="chat-item" on:click={()=>{
							receiver=obj.Receiver;
							ws.send(JSON.stringify({receiver,sender}));
							func4();
						}
						} class:selected={receiver == obj.Receiver}>
						  <div class="user-avatar">
							<img style="border-radius: 30px; border:#007bff 1px solid" src={`/download/profile/${obj.Receiver}`} height=50px width=50px>

							<!-- <img src="user-avatar.jpg" alt="User Avatar"> -->
						  </div>
						  <div class="user-info">
							<p class="user-name" style="padding-left:10px">{obj.Receiver}</p>
							<p style="padding-left:10px" class:online={onlineusers?.includes(obj.Receiver)} class:offline={!(onlineusers?.includes(obj.Receiver))}>{onlineusers?.includes(obj.Receiver)?"Online":"Offline"}</p>
						  </div>
						</div>
					</div>
				{/each}
			</div>		
		</div>
	</div>
		
	<div class="content" class:c2={!mobileview} >

				<div class="topbar" >
					<div class="mobiletoggle" >
						<img width=20px height=20px src="menu.png" on:click={func4}>
					</div>

					<div style="flex:4; text-align:center ">
						{receiver || ""}
					</div>
					<span>
						<form method="post" use:enhance action="?/removeuser">
							<input type="text" name=user hidden value={receiver}>
							<button class:remusr={!receiver} type="submit" style="font-size:92%;background-color:transparent; border:none; color:blue; padding-right:7px; "> Remove User </button>
							<span class:remusr={!receiver} style="font-size:100%;color:blue; padding-right:10px; "> |</span>
						</form>
					</span>
					<a href="/logout" style="text-decoration:none; color: blue"> Logout </a>
				</div>
				<div class="messages" id="myele" style="padding-bottom:100px" bind:this={scrollable} >

					{#each conversation || [] as obj}
					{#if obj.Message.startsWith("Document") && obj.Sender==sender}
					<div class="Component" style="max-width:450px; margin: 10px; width: auto; height: auto; padding-top: 10px; padding-bottom: 20px; padding-left: 60px; padding-right: 60px; background: #DFF4F9; border-top-left-radius: 80px; border-top-right-radius: 20px; border-bottom-right-radius: 80px; border-bottom-left-radius: 80px;">
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<!-- svelte-ignore a11y-missing-attribute -->
						<div class="Component" style="color: #10363F; font-size: 18px; font-family: DM Sans; font-weight: 700;  word-wrap: break-word">{obj.Message}<img src="download.png" height="30px" width="40px"
						style="padding-left:20px; padding-top:10px"
						id={obj.CId} on:click={(e)=>{
							const cid= e.target.id
							const anchor = document.createElement('a');
							anchor.href = `/download/${cid}`;
							anchor.target = '_blank'; // Open link in a new tab/window
							document.body.appendChild(anchor);
							anchor.click();
							document.body.removeChild(anchor); 
						}}>
						{#if (obj.Message.endsWith(".jpg") || obj.Message.endsWith('.jpeg') || obj.Message.endsWith('png'))}
							<div style=" text-align:center; padding:10px">
								<img style="border-radius: 10px; width:auto; height:auto; max-height:200px;max-width:320px; border:#007bff 1px solid" src={`/download/image/${obj.CId}`} >
							</div>
						{/if}
						</div>
					</div>
					{:else if obj.Message.startsWith("Document") && obj.Receiver==sender}
					<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
					<div class="Properties" style="max-width:450px; margin: 10px; width: auto; height: auto; padding-top: 10px; padding-bottom: 20px; padding-left: 60px; padding-right: 60px; align-self:flex-start; background: #FBC8C4; border-top-left-radius: 20px; border-top-right-radius: 80px; border-bottom-right-radius: 80px; border-bottom-left-radius: 80px;">
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-missing-attribute -->
						<div class="Properties" style="text-align: center; color: #700B0B; font-size: 18px; font-family: DM Sans; font-weight: 700;  word-wrap: break-word">{obj.Message}<img src="download.png" height="30px" width="40px"
							style="padding-left:20px; padding-top:10px"
							id={obj.CId} on:click={(e)=>{
								const cid= e.target.id
								const anchor = document.createElement('a');
								anchor.href = `/download/${cid}`;
								anchor.target = '_blank'; // Open link in a new tab/window
								document.body.appendChild(anchor);
								anchor.click();
								document.body.removeChild(anchor); 
							}}>
							{#if (obj.Message.endsWith(".jpg") || obj.Message.endsWith('.jpeg') || obj.Message.endsWith('png'))}
							<div style="text-align:center; padding:10px">
								<img style="border-radius: 10px; width:auto; height:auto; max-height:200px;max-width:320px; border:#007bff 1px solid" src={`/download/image/${obj.CId}`} height="200px"  >
							</div>
						{/if}	
						</div>
					</div>
					{:else if obj.Sender==sender}
					<div class="Component" style="max-width:500px; margin: 10px; width: auto; height: auto; padding-top: 10px; padding-bottom: 20px; padding-left: 60px; padding-right: 60px; background:#DFF4F9; border-top-left-radius: 80px; border-top-right-radius: 20px; border-bottom-right-radius: 80px; border-bottom-left-radius: 80px;">
						<div class="Component" style="color: #10363F; font-size: 18px; font-family: DM Sans; font-weight: 700;  word-wrap: break-word">{obj.Message}</div>
					</div>
					{:else}
					<div class="Properties" style="max-width:500px; margin: 10px; width: auto; height: auto; padding-top: 10px; padding-bottom: 20px; padding-left: 60px; padding-right: 60px; align-self:flex-start; background: #FBC8C4; border-top-left-radius: 20px; border-top-right-radius: 80px; border-bottom-right-radius: 80px; border-bottom-left-radius: 80px;">
						<div class="Properties" style="text-align: center; color: #700B0B; font-size: 18px; font-family: DM Sans; font-weight: 700;  word-wrap: break-word">{obj.Message}</div>
					</div>
					{/if}
					{/each}
				</div>
			<div class="footer"   >

				<form class="form2"
							method="post"
							use:enhance={({
								formElement,
								formData,
								action,
								cancel,
								submitter,
							}) => {
								// `formElement` is this `<form>` element
								formData.set("receiver", receiver);
								// `formData` is its `FormData` object that's about to be submitted
								// `action` is the URL to which the form is posted
								// calling `cancel()` will prevent the submission
								// `submitter` is the `HTMLElement` that caused the form to be submitted
			
								return async ({ result, update }) => {
									// `result` is an `ActionResult` object
									update();
									ws.send(JSON.stringify({receiver,sender}));
							

	
									// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
								};
							}}
							action="?/message">
							<div class="espace"></div>
							<button type="button" on:click|preventDefault={()=>{inputfile.click()}} class="docbutton"> Send Document </button>
				<input type="text" class="modern-input2" placeholder="Type your message..." name="message">
				<div class="rightspace">
					<button class="send-button" type="submit" >Send</button>
				</div>
				
			</form>
			<form method="post" enctype="multipart/form-data" use:enhance={({formData}) => {
					formData.set("receiver",receiver);
				return async ({ update }) => {
					update();
					ws.send(JSON.stringify({receiver,sender}));
				};
			}} action="?/document">
				<input type="file" name="file" hidden bind:this={inputfile} on:change={()=>{filesubmit.click();}}>
				<button type="submit" hidden bind:this={filesubmit}></button>
			</form>
			</div>		
	</div>
</div>
<!-- <h3> <a href="/logout">Logout </a> </h3>
<div>
	You are {data.res.username}
</div>
<div>
	Your email is {data.res.email} -->
<!-- </div> -->

<style>
.body-container {
  width: 100%;
  display: flex;
  min-height: 100vh;
}	
.selected{
	border: 1px solid #6d00ff;
}
.sidebar {
	background-color:aliceblue;
  flex: 4;
  flex-grow: 1;
  border-radius: 10px;
  position: fixed;
  height: 100vh;
  z-index: 2;
}
.remusr{
	display: none;
}
.footer{
	position: fixed;
	display: absolute;
	bottom:0px;
	width:auto;  display:absolute; right:0px; left:230px;
	background-color: white;
}
.input-container{
	flex:2
}
.conversations {
	flex:10;
}
.content {
  flex: 8;
  display: flex;
  flex-direction: column;
  
}

.topbar{
	flex: 1;
	background-color:aliceblue;
	display: flex;
	padding: 20px;
	position:fixed; width:auto;  display:absolute; right:0px; left:230px;
	z-index: 1;
}
.messages{
	flex:10;
	display: flex;
	flex-direction: column;
	justify-content:baseline;
	align-items: end;
	margin-top: 10vh;
	margin-bottom: 10vh;
	position: absolute;
	left:310px;
	right: 0px;
	overflow: auto;
	padding: 10px;
}

.online{
	color: green;
}
.offline{
	color:grey;
}

.form2{
	flex: 1;
	display: flex;
}
.modern-input {

  width: 200px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
}

.modern-input:focus {
  border-color: #007bff;
}

.espace{
	flex:1;
}
.modern-input2 {

  flex: 8;
  margin: 10px;
  min-width: 60%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
}

.modern-input2:focus {
  border-color: #007bff;
}
.rightspace{
	flex:2;
	position: relative;
}
.send-button {
	position: absolute;
	margin: 10px;
	top: 0;
	bottom: 0;
	width: 100px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  cursor: pointer;
}
.docbutton{
	margin: 10px;
	width: 100px;

	background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  cursor: pointer;
}

.send-button:hover {
  background-color: #0056b3;
}



:global(*){
        box-sizing : border-box;
        margin: 0;
        padding: 0;
    }



.chat-list {
  margin-top: 5px; 
  background-color: #fff; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
  border-radius: 8px;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
}


.mobile{
	display:none;
}
.msidebar{
	display:none;
}
.mobilemenu{
	display: none;
}
.mobiletoggle{
	display: none;
}


@media (max-width: 1026px) {
	.messages{
		left:0px;
	}
	.espace{
		display: none;
	}
	.rightspace{
		flex:4;
		position: relative;
	}
	.modern-input2 {

		flex: 8;
		margin: 10px;
		min-width: 40%;
		padding: 10px;
		border: 1px solid #ccc;
		border-radius: 10px;
		font-size: 16px;
		outline: none;
		transition: border-color 0.3s;
		}
	.send-button {
		position: absolute;
		margin: 10px;
		top: 0;
		bottom: 0;
		width: 80px;
		background-color: #007bff;
		color: #fff;
		border: none;
		border-radius: 10px;
		padding: 10px 20px;
		cursor: pointer;
}
	.topbar{
		left:0px;
	}
	.footer{
		left:0px;
		align-items: center;
	}
	.c2{
	display: none;
}
    .sidebar {
        display: none;
    }
	.mobile{
	display:block;
	width: 100%;
	padding: 20px;
}
.msidebar{
	display:block;
}
.mobilemenu{
	display: block;
	width: 100%;

}
.mobilemenuhidden{
	display:none;
}
.mobiletoggle{
	display: block;
	float: left;
}

    }

</style>

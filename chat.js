const HOST = "127.0.0.1";
const PORT = "7779"

var conn = null;

function blink_title_1()
{
	document.title = "NEW MESSAGE!";
	if (!document.hasFocus())
	{
		setTimeout(blink_title_2, 500);
	}
}

function blink_title_2()
{
	document.title = " ";
	if (!document.hasFocus())
	{
		setTimeout(blink_title_1, 500);
	}
}

function on_input_key(ev)
{
	ev = ev || window.event;
	if (ev.keyCode == 13)
	{
		let msg = ev.srcElement.value;
		ev.srcElement.value = "";
		return send_message(msg);
	}
}

function send_message(msg)
{
	conn.send(msg);
}

function create_message_entry(nick, content)
{
	let output = document.getElementById("chatOutput");
	let new_entry = document.createElement("span");
	new_entry.className = "message";
	let new_entry_nick = document.createElement("span");
	new_entry_nick.className = "nickname";
	new_entry_nick.textContent = nick;
	let new_entry_content = document.createElement("span");
	new_entry_content.className = "content";
	new_entry_content.textContent = content;
	new_entry.appendChild(new_entry_nick);
	new_entry.appendChild(new_entry_content);
	let at_bottom = output.scrollHeight - output.clientHeight <= output.scrollTop + 1;
	output.appendChild(new_entry);
	if (at_bottom)
	{
		output.scrollTop = output.scrollHeight - output.clientHeight
	}
	if (!document.hasFocus())
	{
		setTimeout(blink_title_1, 1);
	}
}

function on_message(msg)
{
	msg = JSON.parse(msg.data);
	if (msg["type"] == "set_name")
	{
		document.getElementById("myName").textContent = msg["name"] + ": ";
		return
	}
	if (msg["sender"] == "system")
	{
		create_message_entry("** ", msg["content"]);
	}
	else
	{
		create_message_entry(msg["sender"] + ": ", msg["content"]);
	}

}

function on_close(ev)
{
	console.log(ev.code)
}

window.onload = function ()
{
	conn = new WebSocket("ws://" + HOST + ":" + PORT);
	conn.onmessage = on_message;
	conn.onclose = on_close;
}

window.onfocus = function ()
{
	document.getElementById("chatInput").focus();
}
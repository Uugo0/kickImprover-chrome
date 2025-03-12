// Check page loading state, logging accordingly
document.onreadystatechange = function () {
    if (document.readyState === "complete"){
        console.log("Website ready!");
        extensionStarter();
    }
    else if (document.readyState === "loading" ||
             document.readyState === "interactive")
        console.log("Website loading...");
    else
        console.log("State change is stuck!");
};

let lastUrl = location.href;
 
// Listen for browser navigation events (Back/Forward/History API changes)
window.addEventListener("popstate", () => {
    if (location.href !== lastUrl) {
        console.log("URL changed via popstate!");
        lastUrl = location.href;
        extensionStarter();
    }
});

// Detect manual URL changes (some sites use pushState without triggering popstate)
setInterval(() => {
    if (location.href !== lastUrl) {
        console.log("URL changed via script!");
        lastUrl = location.href;
        extensionStarter();
    }
}, 60000); // Checks from parameter

function extensionStarter()
{
    if (document.readyState === "complete") {
        const channelChatroom = document.getElementById("channel-chatroom");
        if (channelChatroom) {
            const messageHolder = channelChatroom.querySelector(".no-scrollbar.relative");
            if (messageHolder) {
                const messageObserver = new MutationObserver((messagesList)=>{
                    messagesList.forEach((message)=>{
                        if(message.type === "childList"){
                            messageChecker(message);
                        }
                    })
                })

                messageObserver.observe(messageHolder,config);
            }
        }
    }
}

function messageChecker(message)
{
    let lastMessage= message.addedNodes[message.addedNodes.length-1];
    if(lastMessage){
        if(!lastMessage.classList.contains("message-checked")){
            lastMessage.classList.add('message-checked');
            let messageGroup = lastMessage.querySelector(".break-words");
            if(messageGroup)
                messageGroupChecker(messageGroup);
        }
    }
}

function messageGroupChecker(messageGroup)
{
    let senderGroup = messageGroup.querySelector(".flex-nowrap");
    if(senderGroup){
        let senderNick = senderGroup.querySelector(".inline.font-bold").getAttribute("title");
        senderNickChecker(senderNick,(nickFound)=>{
            if(nickFound){
                messageGroup.style.border = "1px solid #ff2d2d";
            }
            else{
                let senderSVGChecked = false;
                let senderSVGList = senderGroup.querySelectorAll("svg");
                senderSVGList.forEach((senderSVG)=>{
                    if(senderSVG && !senderSVGChecked){
                        console.log("Current SVG:",senderSVG);
                        let senderPATH = senderSVG.querySelector("path");
                        if(senderPATH){
                            console.log("Current PATH:",senderPATH);
                            switch(senderPATH.getAttribute('fill')){
                                case 'url(#HostBadgeA)':
                                    messageGroup.style.border = "1px solid #ce58fd";
                                    break;
                                case '#00C7FF':
                                    messageGroup.style.border = "1px solid #54d6fd";
                                    break;
                                case '#1EFF00':
                                    messageGroup.style.border = "1px solid #20fc04";
                                    break;
                                case 'url(#VIPBadgeA)':
                                    messageGroup.style.border = "1px solid #ffb404";
                                    break;
                                case 'url(#OGBadgeB)':
                                    messageGroup.style.border = "1px solid #02b5af";
                                    break;
                            }
                            senderSVGChecked = true;
                        }
                    }
                });
            }
        });
    }       
}



function senderNickChecker(senderNick,callback)
{
    chrome.storage.local.get({nicknames:[]},(data)=>{
        callback(data.nicknames.includes(senderNick));
    });
    return false;
}

const config = {
    attributes: true,       // Monitor attribute changes
    childList: true,        // Monitor addition/removal of child elements
    subtree: true,          // Monitor changes in descendant nodes
    characterData: true,    // Monitor changes to text content
};
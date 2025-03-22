// Checking page loading state
document.onreadystatechange = function () {
    if (document.readyState === "complete")
        startExtension();
    else if (document.readyState === "loading" || 
                document.readyState === "interactive")
        console.log("Website loading...");
    else
        console.log("State change is stuck!");
};

let lastUrl = location.href;
function handleURLChange(){
    if (location.href !== lastUrl){
        console.log("URL changed!");
        lastUrl = location.href;
        startExtension();
    }
}

// Listen for browser navigation events
window.addEventListener("popstate", () => {
    console.log("popstate event fired");
    handleURLChange();
});
  
window.addEventListener("pushstate", () => {
    console.log("pushstate event fired");
    handleURLChange();
});

// Detect manual URL changes
setInterval(()=>{
    if (location.href !== lastUrl){
        console.log("URL changed via script!");
        lastUrl = location.href;
        startExtension();
    }
},300000);

// Get locally stored data
function getAllData(callback)
{
    chrome.storage.local.get({nicknames:[]},
        (data)=>{callback(data);});
}

// Start extonsion for DOM
function startExtension()
{
    console.log("kickImprover started working!");
    getAllData((data)=>{
        const messageObserver = new MutationObserver((messagesList)=>{
            messagesList.forEach((message)=>{
                if(message)
                    checkNewMessage(message,data);
            })
        })

        // Find Chatroom and observe it
        const channelChatroom = document.getElementById("channel-chatroom");
        if(channelChatroom){
            const messageHolder = channelChatroom.querySelector(".no-scrollbar");
            if(messageHolder)
                messageObserver.observe(messageHolder,config);
        }
    });
}

// Get inner group of lastly added message
function checkNewMessage(message,data)
{
    let lastMessage = message.addedNodes[message.addedNodes.length-1];
    if(lastMessage){
        if(!lastMessage.classList.contains("message-checked")){
            // console.log("Checking lastMessage!");
            lastMessage.classList.add('message-checked');
            let innerGroup = lastMessage.querySelector(".break-words");
            if(innerGroup)
                checkInnerGroup(innerGroup,data);
        }
    }   
}

// Check inner group
function checkInnerGroup(innerGroup,data)
{
    let senderGroup = innerGroup.querySelector(".flex-nowrap");
    if(senderGroup){
        let senderNick = senderGroup.querySelector(".inline").getAttribute("title");
        if(data.nicknames.length > 0){
            // Check if sender nick is included in nickname data
            if(data.nicknames.includes(senderNick))
                addBorderToGroup(innerGroup,"#ff2d2d");
        }
        else
            checkSenderBadges(senderGroup,innerGroup);
    }
}

function checkSenderBadges(senderGroup,innerGroup)
{
    // console.log("Checking senderBadges!");
    let senderSVGChecked = false;
    let senderSVGList = senderGroup.querySelectorAll("svg");
    senderSVGList.forEach((senderSVG)=>{
        if(senderSVG && !senderSVGChecked){
            let senderPATH = senderSVG.querySelector("path");
            if(senderPATH){
                // Add border to message by sender badge
                switch(senderPATH.getAttribute('fill'))
                {
                    case 'url(#HostBadgeA)':
                        addBorderToGroup(innerGroup,"#ce58fd");
                        break;
                    case '#00C7FF':
                        addBorderToGroup(innerGroup,"#54d6fd");
                        break;
                    case '#1EFF00':
                        addBorderToGroup(innerGroup,"#20fc04");
                        break;
                    case 'url(#VIPBadgeA)':
                        addBorderToGroup(innerGroup,"#ffb404");
                        break;
                    case 'url(#OGBadgeB)':
                        addBorderToGroup(innerGroup,"#02b5af");
                        break;
                    case 'url(#FounderBadgeB)':
                        addBorderToGroup(innerGroup,"#d89404");
                        break;
                }
                senderSVGChecked = true;
            }
        }
    });
}


function addBorderToGroup(innerGroup,color)
{
    innerGroup.style.border = "1px solid "+color;
}

const config = {
    attributes: true,       // Monitor attribute changes
    childList: true,        // Monitor addition/removal of child elements
    subtree: true,          // Monitor changes in descendant nodes
    characterData: true,    // Monitor changes to text content
};
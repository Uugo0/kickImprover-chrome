document.addEventListener("DOMContentLoaded", () => {
    const nicknameInput = document.getElementById("nicknameInput");
    const addNicknameBtn = document.getElementById("addNickname");
    const nicknameList = document.getElementById("nicknameList");

    let allNicknames = []; // Store all nicknames

    // Load nicknames from storage
    function loadNicknames() {
        chrome.storage.local.get({ nicknames: [] }, (data) => {
            allNicknames = data.nicknames;
            displayNicknames(allNicknames);
        });
    }

    // Display filtered nicknames
    function displayNicknames(nicknames) {
        nicknameList.innerHTML = ""; // Clear list
        nicknames.forEach(nickname => addNicknameToUI(nickname));
    }

    // Add nickname to UI
    function addNicknameToUI(nickname) {
        const li = document.createElement("li");
        li.textContent = nickname;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "X";
        removeBtn.classList.add("remove-btn");
        removeBtn.addEventListener("click", () => removeNickname(nickname));

        li.appendChild(removeBtn);
        nicknameList.appendChild(li);
    }

    // Add nickname to storage
    function addNickname() {
        const nickname = nicknameInput.value.trim();
        if (!nickname) return;

        chrome.storage.local.get({ nicknames: [] }, (data) => {
            let nicknames = data.nicknames;
            if (!nicknames.includes(nickname)) {
                nicknames.push(nickname);
                chrome.storage.local.set({ nicknames }, () => {
                    allNicknames = nicknames;
                    displayNicknames(allNicknames);
                    nicknameInput.value = "";
                });
            } else {
                alert("Nickname already exists!");
            }
        });
    }

    // Remove nickname from storage
    function removeNickname(nickname) {
        chrome.storage.local.get({ nicknames: [] }, (data) => {
            let nicknames = data.nicknames.filter(name => name !== nickname);
            chrome.storage.local.set({ nicknames }, () => {
                allNicknames = nicknames;
                displayNicknames(allNicknames);
            });
        });
    }

    // Filter nicknames while typing
    nicknameInput.addEventListener("input", () => {
        const searchText = nicknameInput.value.toLowerCase();
        const filteredNicknames = allNicknames.filter(name =>
            name.toLowerCase().includes(searchText)
        );
        displayNicknames(filteredNicknames);
    });

    // Event Listeners
    addNicknameBtn.addEventListener("click", addNickname);
    nicknameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addNickname();
    });

    // Initial Load
    loadNicknames();
});

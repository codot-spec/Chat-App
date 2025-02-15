
       
       const messageTextArea = document.getElementById("messageInput");
        const messageSendBtn = document.getElementById("sendBtn");
        const chatBoxBody = document.getElementById("chatBoxBody");
        const uiGroup = document.getElementById("groups");
        const groupNameHeading = document.getElementById("groupNameHeading");
        const fileInput = document.getElementById("fileInput");
        const deleteGroupBtn = document.getElementById("deleteGroup");
       deleteGroupBtn.disabled = true;
        const socket = io("http://localhost:3000");

        // Socket listener for incoming messages
        socket.on("messages", (messages) => {
            displayMessages(messages);
        });

        messageTextArea.addEventListener("keydown", handleKeyPress);

function handleKeyPress(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        messageSend();
    }
}
      //check active status
         function activeGroup(element) {
            chatBoxBody.innerHTML = "";
            groupNameHeading.textContent = "Loading...";
        
            // Remove active class from previously selected group
            const activeLi = document.querySelector(".active");
            if (activeLi) {
                activeLi.classList.remove("active");
            }
        
            let li = element;
            if (!li || !li.classList) {
                if (element.parentElement && element.parentElement.tagName === 'LI') {
                    li = element.parentElement;
                } else {
                    return;
                }
            }
        
            li.classList.add("active");
            const groupName = li.querySelector(".group-name").textContent;
            localStorage.setItem("groupName", groupName);
        
            groupNameHeading.textContent = groupName; // Set the heading text immediately
        
            getMessages();
        }
        
        // Send message (with or without a file)
        async function messageSend() {
            const message = messageTextArea.value.trim();
            const groupName = localStorage.getItem("groupName");
            const token = localStorage.getItem("token");
        
            if (!groupName) {
                return alert("Please select a group to send the message.");
            }
        
            // If neither message nor file is provided, show an alert
            const file = fileInput.files[0];
            if (!message && !file) {
                return alert("Please enter a message or upload a file.");
            }
        
            const formData = new FormData();
            if (message) {
                formData.append("message", message);  // If a message is provided, append it
            } else {
                formData.append("message", "");  // If no message, set empty string
            }
            formData.append("groupName", groupName);
        
            if (file) {
                formData.append("image", file);  // Add file if uploaded
            }
        
            try {
                await axios.post("http://localhost:3000/chat/sendMessage", formData, {
                    headers: {
                        Authorization: token,
                        "Content-Type": "multipart/form-data"
                    }
                });
        
                messageTextArea.value = "";  // Clear the message input
                fileInput.value = "";        // Clear the file input
                getMessages();               // Refresh the messages after sending
            } catch (error) {
                console.error("Error sending message:", error);
                alert("Failed to send message. Please try again.");
            }
        }
        
        // Fetch and display messages for the selected group
        async function getMessages() {
            const groupName = localStorage.getItem("groupName");
            if (!groupName) {
                return alert("Please select a group to load messages.");
            }
            socket.emit("getMessages", groupName);  // Emit event to fetch messages
        }

        // Display messages in the chat box
        function displayMessages(messages) {
            chatBoxBody.innerHTML = "";  // Clear chat box
        
            messages.forEach((message) => {
                const div = document.createElement("div");
                const sender = document.createElement("span");
                const messageBox = document.createElement("div");
        
                sender.classList.add("sender");
                sender.textContent = message.name || "You";
        
                messageBox.classList.add("messageBox");
                messageBox.textContent = message.message;
        
                // If there's a file attached to the message
                if (message.file) {
                    const fileLink = document.createElement("a");
        
                    // Check if the file is an image by inspecting the file extension or MIME type
                    const isImage = message.file.match(/\.(jpeg|jpg|gif|png|bmp)$/i);
        
                    // Ensure the URL is absolute (assuming files are stored in S3 and are public)
                    const fileUrl = message.file;
        
                    if (isImage) {
                        // Create image element
                        const img = document.createElement("img");
                        img.src = fileUrl;  // Use the file URL for the image
                        img.alt = "Image";
                        img.classList.add("imageMessage");
                        
                        // Add CSS styles to control image size
                        img.style.maxWidth = "200px";
                        img.style.maxHeight = "100px";
                        img.style.width = "auto";
                        img.style.height = "auto";
        
                        // Wrap the image with a link
                        fileLink.href = fileUrl;
                        fileLink.target = "_blank";  // Ensure it opens in a new tab
                        fileLink.appendChild(img);  // Append image to the link
        
                        messageBox.appendChild(fileLink);  // Append the link (with image) to the message box
                    } else {
                        // For non-image files, create a download link
                        fileLink.href = fileUrl;  // Use the file URL for download
                        fileLink.target = "_blank";  // Ensure it opens in a new tab
                        fileLink.textContent = "Download File";
                        fileLink.classList.add("fileLink");
                        messageBox.appendChild(fileLink);  // Append download link to messageBox
                    }
                }
        
                div.appendChild(sender);
                div.appendChild(messageBox);
                chatBoxBody.appendChild(div);
            });
        }
        
        

        // Event listeners
        messageSendBtn.addEventListener("click", messageSend);  // Send message when button clicked
        uiGroup.addEventListener("click", activeGroup);  // Handle group selection

        // DOM Elements for group actions
        const groupMembersBtn = document.getElementById("viewGroupMembers");
        const createGroupBtn = document.getElementById("createGroup");
        const deleteFromGroupBtn = document.getElementById("deleteFromGroup");
        const logoutBtn = document.getElementById("logout");
        const addToGroupBtn = document.getElementById("addToGroup");

        // Create a Group
        async function createGroup() {
            const groupName = prompt("Enter Group Name:");
            const token = localStorage.getItem("token");
        
            if (!groupName) {
                return alert("Group name cannot be empty.");
            }
        
            try {
                const res = await axios.get("http://localhost:3000/user/getAllUsers", {
                    headers: { Authorization: token },
                });
        
                if (res.status === 200 && res.data && res.data.users) {
                    const allUsers = res.data.users;
        
                    // 1. Create the modal container:
                    const modal = document.createElement('div');
                    modal.classList.add('modal'); // Add a CSS class for styling
                    modal.innerHTML = `
                        <div class="modal-content">
                            <span class="modal-close">&times;</span>  
                            <h3>Select Users for ${groupName}</h3>
                            <div id="user-list"></div>  </div>`;
                    document.body.appendChild(modal);
        
                    const userList = modal.querySelector('#user-list');
        
                    allUsers.forEach(user => {
                        const label = document.createElement("label");
                        label.innerHTML = `
                            <input type="checkbox" value="${user.email}"> ${user.name} (${user.email})<br>
                        `;
                        userList.appendChild(label);
                    });
        
                    // 2. Add a "Create Group" button inside the modal
                    const createButton = document.createElement('button');
                    createButton.textContent = 'Create Group';
                    modal.querySelector('.modal-content').appendChild(createButton);
        
        
                    // 3. Handle modal close and create group logic
                    const closeButton = modal.querySelector('.modal-close');
                    closeButton.addEventListener('click', () => {
                        modal.remove(); // Close the modal
                    });
        
                    createButton.addEventListener('click', async () => {
                        const selectedMembers = [];
                        modal.querySelectorAll("input[type='checkbox']:checked").forEach((checkbox) => {
                            selectedMembers.push(checkbox.value);
                        });
        
                        try {
                            const createRes = await axios.post(
                                "http://localhost:3000/group/createGroup",
                                { groupName, members: selectedMembers },
                                { headers: { Authorization: token } }
                            );
                            if(createRes.status === 201){
                                alert(createRes.data.message);
                                getGroups();
                            } else {
                                alert(createRes.data.error)
                            }
                            modal.remove(); // Close the modal after group creation attempt
                        } catch (createError) {
                            console.error("Error creating group:", createError);
                            alert("Error creating group. Please try again.");
                        }
                    });
        
                } else {
                    console.error("Error fetching users:", res);
                    alert("Error fetching users. Check the console.");
                }
        
            } catch (error) {
                console.error("Error fetching users:", error);
                alert("Error fetching users. Check the console.");
            }
        }


// Get and display all groups
async function getGroups() {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/group/getGroups", {
            headers: { Authorization: token }
        });

        groups.innerHTML = "";  // Clear existing groups

        res.data.groups.forEach(group => {
            const li = document.createElement("li");
            const nameSpan = document.createElement("span");
            nameSpan.textContent = group.name;
            nameSpan.classList.add("group-name");

            const adminSpan = document.createElement("span");
            adminSpan.textContent = `(Admin: ${group.admin?.name || 'Unknown'})`; // Use template literal
            adminSpan.classList.add("group-admin");

            li.appendChild(nameSpan);
            li.appendChild(adminSpan);
            li.addEventListener("click", () => activeGroup(li)); // Use addEventListener
            groups.appendChild(li);

            // Check if the logged-in user is the admin of the group
            const currentUserEmail = localStorage.getItem("email");  // Assuming user email is stored in localStorage

            if (group.admin?.email === currentUserEmail) {
                // Only enable "Add to Group" and "Delete from Group" if the user is the admin
                addToGroupBtn.disabled = false;  // Enable the add button
                deleteFromGroupBtn.disabled = false;  // Enable the delete button
                deleteGroupBtn.disabled = false;
            } else {
                addToGroupBtn.disabled = true;  // Disable the add button
                deleteFromGroupBtn.disabled = true;  // Disable the delete button
                deleteGroupBtn.disabled = true;
            }
        });

        // Select the first group by default (if available)
        if (res.data.groups.length > 0) {
            const firstGroupLi = groups.querySelector("li");
            if (firstGroupLi) {
                activeGroup(firstGroupLi); // Programmatically select the first group
            }
        }

    } catch (error) {
        console.error("Error fetching groups:", error);
        alert("Error fetching groups. Please check your connection and try again.");
    }
}

//Add members to a group
async function addToGroup() {
    const groupName = prompt("Enter Group Name to add members:");
    const token = localStorage.getItem("token");

    if (!groupName) {
        return alert("Group name is required.");
    }

    try {
        const res = await axios.get(`http://localhost:3000/group/groupDetails/${groupName}`, {
            headers: { Authorization: token },
        });

        if (res.status === 200 && res.data && res.data.group) {
            const group = res.data.group;
            const currentUserEmail = localStorage.getItem("email");

            if (group.admin?.email !== currentUserEmail) {
                return alert("You are not authorized to add members to this group.");
            }

            const allUsersRes = await axios.get("http://localhost:3000/user/getAllUsers", {
                headers: { Authorization: token },
            });

            if (allUsersRes.status === 200 && allUsersRes.data && allUsersRes.data.users) {
                const allUsers = allUsersRes.data.users;

                const modal = document.createElement('div');
                modal.classList.add('modal');
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="modal-close">&times;</span>
                        <h3>Select Users to Add to ${groupName}</h3>
                        <div id="user-list"></div>
                        <button id="add-members-btn">Add Members</button>
                    </div>`;
                document.body.appendChild(modal);

                const userList = modal.querySelector('#user-list');

                allUsers.forEach(user => {
                    const label = document.createElement("label");
                    label.innerHTML = `<input type="checkbox" value="${user.email}"> ${user.name} (${user.email})<br>`;
                    userList.appendChild(label);
                });

                const closeButton = modal.querySelector('.modal-close');
                closeButton.addEventListener('click', () => {
                    modal.remove();
                });

                const addMembersButton = modal.querySelector('#add-members-btn');
                addMembersButton.addEventListener('click', async () => {
                    const selectedMembers = [];
                    modal.querySelectorAll("input[type='checkbox']:checked").forEach(checkbox => {
                        selectedMembers.push(checkbox.value);
                    });
                    try {
                        const addRes = await axios.post(
                            "http://localhost:3000/group/addToGroup",
                            { groupName, members: selectedMembers },
                            { headers: { Authorization: token } }
                        );

                        if (addRes.status === 200) {
                            alert(addRes.data.message);
                            getGroups();
                        } else {
                            alert(addRes.data.error || "Failed to add members.");
                        }
                        modal.remove();
                    } catch (addError) {
                        console.error("Error adding members:", addError);
                        alert("Error adding members. Please try again.");
                    }
                });
            }
        } else {
            alert("Error fetching group details.");
        }
    } catch (error) {
        console.error("Error fetching group details:", error);
        alert("Error adding members to group, please try again.");
    }
}

async function deleteFromGroup() {
    const groupName = prompt("Enter Group Name to remove members from:");
    const token = localStorage.getItem("token");

    if (!groupName) {
        return alert("Group name is required.");
    }

    try {
        const res = await axios.get(`http://localhost:3000/group/groupDetails/${groupName}`, {
            headers: { Authorization: token }
        });
console.log(res.data);
        if (res.status === 200 && res.data && res.data.group) {
            const group = res.data.group;
            const currentUserEmail = localStorage.getItem("email");

            if (group.admin?.email !== currentUserEmail) {
                return alert("You are not authorized to remove members from this group.");
            }

            const groupMembers = group.members;
            const modal = document.createElement('div');
            modal.classList.add('modal');
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="modal-close">&times;</span>
                    <h3>Select Users to Remove from ${groupName}</h3>
                    <div id="user-list"></div>
                    <button id="remove-members-btn">Remove Members</button>
                </div>`;
            document.body.appendChild(modal);

            const userList = modal.querySelector('#user-list');

          if (groupMembers && Array.isArray(groupMembers)) {
    groupMembers.forEach(user => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="checkbox" value="${user.email}"> ${user.name} (${user.email})<br>`;
        userList.appendChild(label);
    });
} else {
    console.error("No members found for this group or error fetching members:", res.data);
    alert("No members found in this group.");
    const userList = modal.querySelector('#user-list');
    userList.innerHTML = ""; // Clear existing members
}

            const closeButton = modal.querySelector('.modal-close');
            closeButton.addEventListener('click', () => {
                modal.remove();
            });

            const removeMembersButton = modal.querySelector('#remove-members-btn');
            removeMembersButton.addEventListener('click', async () => {
                const selectedMembers = [];
                modal.querySelectorAll("input[type='checkbox']:checked").forEach(checkbox => {
                    selectedMembers.push(checkbox.value);
                });

                try {
                    const removeRes = await axios.post(
                        "http://localhost:3000/group/deleteFromGroup",
                        { groupName, members: selectedMembers },
                        { headers: { Authorization: token } }
                    );

                    if (removeRes.status === 200) {
                        alert(removeRes.data.message);
                        getGroups();
                    } else {
                        alert(removeRes.data.error || "Failed to remove members.");
                    }
                    modal.remove();
                } catch (removeError) {
                    console.error("Error removing members:", removeError);
                    alert("Error removing members. Please try again.");
                }
            });

        } else {
            alert("Error fetching group members.");
        }
    } catch (error) {
        console.error("Error removing members:", error);
        alert("Error removing members. Please try again.");
    }
}

       // View group members
        async function viewGroupMembers() {
            const groupName = localStorage.getItem("groupName");
            if (!groupName) {
                return alert("Please select a group first!");
            }

            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`http://localhost:3000/group/groupMembers/${groupName}`, {
                    headers: { Authorization: token }
                });
                chatBoxBody.innerHTML = "";  // Clear existing members
                res.data.users.forEach(user => {
                    const div = document.createElement("div");
                    div.textContent = `${user.name} is a member of ${groupName}`;
                    chatBoxBody.appendChild(div);
                });
            } catch (error) {
                alert("Error fetching group members, please try again.");
                console.error("Error fetching group members:", error);
            }
        }

       
//Delete group
        async function deleteGroup() {
            const groupName = localStorage.getItem("groupName");
            if (!groupName) {
                return alert("Please select a group to delete.");
            }
        
            try {
                const token = localStorage.getItem("token");
        
                // Get Group Details
                const resDetails = await axios.get(`http://localhost:3000/group/groupDetails/${groupName}`, {
                    headers: { Authorization: token }
                });
        
                if (resDetails.status !== 200 || !resDetails.data || !resDetails.data.group) {
                    throw new Error("Error fetching group details.");
                }
        
                const group = resDetails.data.group;
                const currentUserEmail = localStorage.getItem("email");
        
                if (group.admin?.email !== currentUserEmail) {
                    return alert("You are not authorized to delete this group.");
                }
        
                if (!confirm(`Are you sure you want to delete ${groupName}?`)) {
                    return;
                }
        
                // Delete Group
                const res = await axios.post("http://localhost:3000/group/deleteGroup", { groupName }, {
                    headers: { Authorization: token }
                });
        
                if (res.status === 200) {
                    alert(res.data.message);
                    getGroups();
                    chatBoxBody.innerHTML = "";
                    groupNameHeading.textContent = "";
                } else {
                    alert(res.data.error || res.data.message || "Failed to delete group.");
                }
        
            } catch (error) {
                console.error("Error deleting group:", error);
                alert(error.message || "Error deleting group. Please try again.");
            }
        }

        // Log out the user
        function logout() {
            localStorage.clear();
            window.location.href = "http://localhost:3000";  // Redirect to login page
        }

        document.getElementById("actionMenuBtn").addEventListener("click", function() {
          const actionMenu = document.getElementById("actionMenu");
          actionMenu.classList.toggle("active");  // Toggle the "active" class to show/hide menu
        });

        // Event Listeners for action menu
        groupMembersBtn.addEventListener("click", viewGroupMembers);
        createGroupBtn.addEventListener("click", createGroup);
        addToGroupBtn.addEventListener("click", addToGroup);
        deleteFromGroupBtn.addEventListener("click", deleteFromGroup);
        deleteGroupBtn.addEventListener("click", deleteGroup);
        logoutBtn.addEventListener("click", logout);

        // Load groups when the page is loaded
        document.addEventListener("DOMContentLoaded", getGroups);

        function profile(){
            window.location.href = "../profile/index.html";
          }

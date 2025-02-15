function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  
    return JSON.parse(jsonPayload);
  }
  
  
  // Fetch and display user profile
  function fetchAndDisplayProfile() {
    const token = localStorage.getItem('token');
    const decodedToken = parseJwt(token);
    const userId = decodedToken.userId;

    axios.get(`http://localhost:3000/user/${userId}`, { headers: { "Authorization": token } })
        .then(response => {
            const user = response.data;
            // Update the profile view
            document.getElementById('profileName').textContent = user.name;
            document.getElementById('profileEmail').textContent = user.email;
            document.getElementById('profilePhone').textContent = user.phonenumber;
            document.getElementById('profilePassword').textContent = user.password; // For demonstration, avoid doing this in production.


            // Edit and Delete actions
            document.getElementById('editButton').onclick = () => editUser(user.id, user.name, user.email, user.password, user.phonenumber);
            document.getElementById('deleteButton').onclick = () => deleteProfile(user.id);
        })
        .catch(error => console.log(error));
}

function editUser(userId, name, email, password, phonenumber) {
    document.getElementById('editForm').style.display = 'block';
    document.getElementById('profile').style.display = 'none';

    document.getElementById('editName').value = name;
    document.getElementById('editEmail').value = email;
    document.getElementById('editPhone').value = phonenumber;
    document.getElementById('editPassword').value = password;

    // Set the userId in the form for submission
    document.getElementById('form').dataset.userId = userId;
}

function handleFormSubmit(event) {
    event.preventDefault();

    const userId = event.target.dataset.userId;
    const userDetails = {
        name: event.target.name.value,
        email: event.target.email.value,
        password: event.target.password.value,
        phonenumber: event.target.phonenumber.value
    };
    const token = localStorage.getItem('token');
    axios.put(`http://localhost:3000/user/${userId}`, userDetails, { headers: { "Authorization": token } })
        .then(response => {
            reloadProfile();
        })
        .catch(error => console.log(error));

    event.target.reset();
    delete event.target.dataset.userId;
}

function reloadProfile() {
    const token = localStorage.getItem('token');
    const decodedToken = parseJwt(token);
    const userId = decodedToken.userId;

    axios.get(`http://localhost:3000/user/${userId}`, { headers: { "Authorization": token } })
        .then(response => {
            const user = response.data;
            document.getElementById('profileName').textContent = user.name;
            document.getElementById('profileEmail').textContent = user.email;
            document.getElementById('profilePhone').textContent = user.phonenumber;
            document.getElementById('profilePassword').textContent = user.password;

            document.getElementById('editForm').style.display = 'none';
            document.getElementById('profile').style.display = 'block';
        })
        .catch(error => console.log(error));
}

function deleteProfile(userId) {
    const token = localStorage.getItem('token');
    axios.delete(`http://localhost:3000/user/${userId}`, { headers: { "Authorization": token } })
        .then(() => {
            alert('User deleted');
            window.location.href = 'http://localhost:3000';
        })
        .catch(error => console.log(error));
}


    // Display user profile when page loads
    window.addEventListener('DOMContentLoaded', fetchAndDisplayProfile);
  
  
    function logout() {
      localStorage.clear();
      window.location.href = "http://localhost:3000";
    }
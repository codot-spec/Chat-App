async function SignIn(event){
    try{
      event.preventDefault();
      console.log(event.target.email.value);
      const loginDetails = {
        email: event.target.email.value,
        password: event.target.password.value,
      };
      console.log(loginDetails);
      const response = await  axios.post("http://localhost:3000/user/sign-in", loginDetails)
       
      alert(response.data.message)
      localStorage.setItem("email", response.data.user.email);
        localStorage.setItem('token',response.data.token);
        window.location.href = "../chat/index.html"
     }
    catch(err){
      document.body.innerHTML += `<div style="color:red;"> ${err.message} <div> `
    }
}

function forgotpassword() {
    window.location.href = "../ForgotPassword/index.html"
}
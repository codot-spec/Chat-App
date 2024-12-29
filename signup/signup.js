async function SignUp(event){
  try{
    event.preventDefault();
    console.log(event.target.email.value);
    const userDetails = {
      name: event.target.name.value,
      email: event.target.email.value,
      phonenumber: event.target.phone.value,
      password: event.target.password.value
      
    };

    console.log(userDetails);
    const response = await axios.post("http://localhost:3000/user/sign-up", userDetails)
    if(response.status === 201){
      alert(response.data.message)
      window.location.href = "../login/login.html"
    }
    else if (response.status === 403){
      alert(response.data.message)
    }
  }
  catch(err){
    document.body.innerHTML += `<div style="color:red;">${err.message} <div> `
  }
}
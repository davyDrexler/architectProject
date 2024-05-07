window.addEventListener("load", function() {
    var btnSubmit = document.getElementById("btn-submit");
    
    btnSubmit.addEventListener("click", function(event) {
        event.preventDefault(); //Evite de refresh ou envoyer vers une autre page

        var email = document.getElementById("email").value;
        var password = document.getElementById("pw").value;

        // Création de l'objet JSON à envoyer à l'API
        var userData = {
            email: email,
            password: password
        };

        // Envoyer une requête à votre API pour vérifier les informations de connexion
        var request = new XMLHttpRequest();
        request.open("POST", "http://localhost:5678/api/users/login");
        request.setRequestHeader("Content-Type", "application/json");
        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    var response = JSON.parse(request.responseText);
                    if (response.userId && response.token) {
                        // Stocker le token dans le localStorage
                        localStorage.setItem('token', response.token);
                        // Redirection vers la page d'accueil
                        window.location.href = "index.html";
                    } else {
                        alert("Identifiants incorrects. Veuillez réessayer.");
                    }
                } else if (request.status === 404){
                    alert("Compte utilisateur introuvable");
                } else if (request.status === 401){
                    alert("Mots de passe incorrect")
                }
            }
        };
        // Envoi de l'objet JSON comme corps de la requête
        request.send(JSON.stringify(userData));
    });
});

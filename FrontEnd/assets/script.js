document.addEventListener('DOMContentLoaded', function() {
    const gallery = document.getElementById('gallery');
    const categoryButtons = document.querySelectorAll('.categorie .button');
    const loginButton = document.getElementById('log-in');
    const logoutButton = document.getElementById('logout');
    const bannerEdition = document.getElementById('bannerEdit');
    const header = document.getElementById('header');
    let currentCategory = null;
    let login = false;

    // Fonction pour filtrer les images en fonction de la catégorie sélectionnée
    function filterImages(categoryId) {
        const images = gallery.querySelectorAll('div[data-category-id]');
        images.forEach(function(image) {
            if (categoryId === 'Tous' || image.dataset.categoryId === categoryId) {
                image.style.display = 'block';
            } else {
                image.style.display = 'none';
            }
        });
    }

    categoryButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Retire la classe .select-button de tous les boutons
            categoryButtons.forEach(function(btn) {
                btn.classList.remove('select-button');
            });
            // Ajoute la classe .select-button au bouton actuel
            this.classList.add('select-button');

            const categoryId = this.dataset.categoryId;

            if (categoryId !== currentCategory) {
                currentCategory = categoryId;
                filterImages(currentCategory);
            }
        });
    });

    // Charger les catégories et initialiser les boutons de catégorie
    function loadCategories() {
        fetch('http://localhost:5678/api/categories')
            .then(function(response) {
                return response.json();
            })
            .then(function(categories) {
                categoryButtons.forEach(function(button) {
                    const category = categories.find(function(cat) {
                        return cat.name === button.id;
                    });
                    if (category) {
                        button.dataset.categoryId = category.id;
                    }
                });
            })
            .catch(function(error) {
                console.error("Probleme rencontré lors du chargment des catégorie", error);
            });
    }

    loadCategories();

    document.getElementById('Tous').addEventListener('click', function() {
        // Retire la classe .select-button de tous les boutons
        categoryButtons.forEach(function(btn) {
            btn.classList.remove('select-button');
        });
        // Ajoute la classe .select-button au bouton "Tous"
        this.classList.add('select-button');
        currentCategory = 'Tous';
        filterImages(currentCategory);
    });

    function imageGenerator() {
        fetch('http://localhost:5678/api/works')
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                data.forEach(function(work) {
                    const image = document.createElement('div');
                    image.dataset.categoryId = work.category.id;
                    image.style.display = 'block';
                    const imgElement = document.createElement('img');
                    imgElement.src = work.imageUrl;
                    imgElement.alt = work.title;
                    const title = document.createElement('p');
                    title.textContent = work.title;
                    image.appendChild(imgElement);
                    image.appendChild(title);
                    gallery.appendChild(image);
                });
            })
            .catch(function(error) {
                console.error("probleme dans le chargement des travaux", error);
            });
    }

    imageGenerator();

    // Fonction pour déconnecter l'utilisateur
    function logoutUser() {
        // Supprimer le token du localStorage
        localStorage.removeItem('token');
        login = false;
        location.reload();
    }

    logoutButton.addEventListener('click', function() {
        logoutUser();
    });

    // Fonction pour rafraîchir et réafficher les images depuis l'API
    function refreshImages() {
        // Effacer toutes les images actuellement affichées dans la galerie
        gallery.innerHTML = '';

        // Recharger les images depuis l'API et les afficher dans la galerie
        imageGenerator();
    }

    const modifyElement = document.getElementById('modif');

    const openFirstModalFunction = function() {
        // Vérifier si la modal existe déjà
        let modal = document.getElementById('modal');

        if (!modal) {
            // Création de l'élément modal si elle n'existe pas encore
            modal = document.createElement('div');
            modal.id = 'modal';
            modal.classList.add('modal');
            modal.style.display = 'block';

            // Création du contenu modal
            const modalContent = document.createElement('div');
            modalContent.classList.add('modal-content');

            // Création du bouton de fermeture
            const closeButton = document.createElement('button');
            closeButton.textContent = 'x';
            closeButton.classList.add('modal-close-button');
            closeButton.addEventListener('click', function() {
                modal.style.display = 'none';
            });
            modalContent.appendChild(closeButton);

            // Création de la div gallery-text
            const galleryText = document.createElement('div');
            galleryText.id = 'gallery-text';
            const h2 = document.createElement('h2');
            h2.textContent = 'Galerie photo';
            galleryText.appendChild(h2);
            modalContent.appendChild(galleryText);

            // Création de la div modal-square
            const modalSquare = document.createElement('div');
            modalSquare.classList.add('modal-square');
            modalContent.appendChild(modalSquare);

            // Fonction pour récupérer et afficher les images
            function fetchAndDisplayImages() {
                // Efface les images actuellement affichées
                modalSquare.innerHTML = '';

                // Requête fetch pour récupérer les travaux depuis l'API
                fetch('http://localhost:5678/api/works')
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(data) {
                        data.forEach(function(work) {
                            // Création de l'élément d'image
                            const imageContainer = document.createElement('div');
                            imageContainer.classList.add('image-container');

                            const imgElement = document.createElement('img');
                            imgElement.src = work.imageUrl;
                            imgElement.alt = work.title;

                            // Ajout de l'icône de la corbeille
                            const trashIcon = document.createElement('i');
                            trashIcon.classList.add('fa-solid', 'fa-trash-can');
                            imageContainer.appendChild(imgElement);
                            imageContainer.appendChild(trashIcon);

                            // Ajout du gestionnaire d'événements au clic sur l'icône de la corbeille
                            trashIcon.addEventListener('click', function() {
                                const imageId = work.id;
                                const apiUrl = `http://localhost:5678/api/works/${imageId}`;

                                fetch(apiUrl, {
                                        method: 'DELETE',
                                        headers: {
                                            'Authorization': `Bearer ${token}`,
                                            'Content-Type': 'application/json'
                                        }
                                    })
                                    .then(function(response) {
                                        if (!response.ok) {
                                            throw new Error('La requête n\'a pas abouti.');
                                        }
                                        // Une fois l'image supprimée avec succès, rechargez les images
                                        fetchAndDisplayImages();
                                        refreshImages();
                                    })
                                    .catch(function(error) {
                                        console.error('Une erreur s\'est produite lors de la suppression de l\'image:', error);
                                    });
                            });

                            // Ajout de l'image avec l'icône de la corbeille à la modal-square
                            modalSquare.appendChild(imageContainer);
                        });
                    })
                    .catch(function(error) {
                        console.error("Une erreur s'est produite lors du chargement des images depuis l'API :", error);
                    });
            }

            // Appel de la fonction pour récupérer et afficher les images
            fetchAndDisplayImages();

            // Création de la div add-photo
            const addPhotoSection = document.createElement('div');
            addPhotoSection.classList.add('add-photo');

            const addDiv = document.createElement('h2');
            addDiv.textContent = 'Ajouter une photo'
            addDiv.id = 'add';
            // Ajout d'un écouteur d'événements pour le clic sur l'élément "add"
            addDiv.addEventListener('click', function() {
                openSecondModal();
                const firstModal = document.getElementById('modal');
                if (firstModal) {
                    firstModal.parentNode.removeChild(firstModal);
                }
            });

            modalContent.appendChild(addPhotoSection);
            modal.appendChild(modalContent);
            addPhotoSection.appendChild(addDiv);

            // Ajout du modal à la fin du body
            document.body.appendChild(modal);
        } else {
            // Si la modal existe déjà, la rendre visible
            modal.style.display = 'block';
        }
    };

    modifyElement.addEventListener('click', openFirstModalFunction);

    function openSecondModal() {
        // Vérifier si la modal existe déjà
        let secondModal = document.getElementById('second-modal');

        if (!secondModal) {
            // Création de la deuxième modal si elle n'existe pas encore
            secondModal = document.createElement('div');
            secondModal.id = 'second-modal';
            secondModal.classList.add('modal');
            secondModal.style.display = 'block';

            // Création de la div modal-content
            const modalContent = document.createElement('div');
            modalContent.classList.add('modal-content');

            // Création du bouton de fermeture
            const closeButton = document.createElement('button');
            closeButton.textContent = 'x';
            closeButton.classList.add('modal-close-button');
            closeButton.addEventListener('click', function() {
                const SecondModal = document.getElementById('second-modal');
                if (SecondModal) {
                    SecondModal.parentNode.removeChild(SecondModal);
                }
            });

            // Création du bouton de retour en arrière
            const backButton = document.createElement('div');
            backButton.classList.add('fa-solid', 'fa-arrow-left');
            backButton.addEventListener('click', function() {
                secondModal.style.display = 'none';
                const SecondModal = document.getElementById('second-modal');
                if (SecondModal) {
                    SecondModal.parentNode.removeChild(SecondModal);
                }
                openFirstModalFunction();
            });

            modalContent.appendChild(backButton);

            // Ajout du bouton de fermeture et du contenu à la div modal-content
            modalContent.appendChild(closeButton);

            // Création de la div gallery-text
            const headerText = document.createElement('div');
            headerText.id = 'addphoto-text';
            const h2 = document.createElement('h2');
            h2.textContent = 'Ajout photo';
            headerText.appendChild(h2);
            modalContent.appendChild(headerText);

            // Création du form
            const form = document.createElement('form');
            form.id = 'image-form';

            // Permet d'ajouter l'image a l'API
            form.addEventListener('submit', function(event) {
                event.preventDefault(); // Empêche la soumission par défaut du form

                const formData = new FormData(form); // Récupère les données du formu

                // Envoi du form vers l'API
                fetch('http://localhost:5678/api/works', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    })
                    .then(function(response) {
                        if (!response.ok) {
                            throw new Error('La requête n\'a pas abouti.');
                        }
                        return response.json(); // Récupère la réponse JSON de l'API
                    })
                    .then(function(data) {
                        console.log('Image ajoutée avec succès:', data);
                        refreshImages();
                        const SecondModal = document.getElementById('second-modal');
                        if (SecondModal) {
                            SecondModal.parentNode.removeChild(SecondModal);
                        }
                    })
                    .catch(function(error) {
                        console.error('Une erreur s\'est produite lors de l\'ajout de l\'image:', error);
                    });
            });

            // Création du bouton personnalisé pour le téléchargement d'image
            const customFileInput = document.createElement('div');
            customFileInput.classList.add('custom-file-input');
            const customFileInputLabel = document.createElement('label');
            customFileInputLabel.classList.add('add-pictures-zone');

            // Création de l'icon Picture
            const icon = document.createElement('i');
            icon.classList.add('fa-regular', 'fa-image');
            customFileInputLabel.appendChild(icon);

            // Ajout du texte du bouton
            const buttonText = document.createElement('h2');
            buttonText.textContent = '+ Ajouter photo';
            customFileInputLabel.appendChild(buttonText);

            customFileInputLabel.setAttribute('for', 'image-file');
            customFileInput.appendChild(customFileInputLabel);

            // Ajout du bouton personnalisé à la modal-content
            form.appendChild(customFileInput);

            // Input pour l'image
            const imageLabel = document.createElement('label');
            imageLabel.textContent = '';
            const imageInput = document.createElement('input');
            imageInput.type = 'file';
            imageInput.name = 'image';
            imageLabel.appendChild(imageInput);
            form.appendChild(imageLabel);

            // Input pour le titre
            const titleHeader = document.createElement('h3'); // Utilisation de <h3> pour le titre
            titleHeader.textContent = 'Titre'; // Texte du titre
            const titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.name = 'title';
            titleHeader.appendChild(titleInput);
            form.appendChild(titleHeader);


            // Sélection de la catégorie
            const categoryHeader = document.createElement('h3'); // Utilisation de <h3> pour le titre
            categoryHeader.textContent = 'Catégorie:'; // Texte du titre
            const categorySelect = document.createElement('select');
            categorySelect.name = 'category';
            categoryHeader.appendChild(categorySelect);
            form.appendChild(categoryHeader);


            // Ajout des options de catégorie
            const categories = [{
                    id: 1,
                    name: 'Objets'
                },
                {
                    id: 2,
                    name: 'Appartements'
                },
                {
                    id: 3,
                    name: 'Hotel & restaurants'
                }
            ];
            categories.forEach(function(category) {
                const option = document.createElement('option');
                option.value = category.id; // Utilisez l'identifiant numérique comme valeur
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });

            categoryHeader.appendChild(categorySelect);
            form.appendChild(categoryHeader);

            // Cacher le bouton d'entrée de fichier standard
            imageInput.style.display = 'none';

            customFileInputLabel.addEventListener('click', function() {
                imageInput.click();
            });

            // Création de la div add-photo
            const bar = document.createElement('div');
            bar.classList.add('add-photo');
            form.appendChild(bar);

            // Bouton de soumission
            const submitButton = document.createElement('button');
            submitButton.type = 'submit';
            submitButton.textContent = 'Ajouter une photo';
            form.appendChild(submitButton);

            // Ajout du form à la div modal-content
            modalContent.appendChild(form);

            // Ajout de la div modal-content à la deuxième modal
            secondModal.appendChild(modalContent);

            // Ajout de la deuxième modal au corps du document
            document.body.appendChild(secondModal);

        } else {
            // Si la modal existe déjà, la rendre visible
            secondModal.style.display = 'block';
        }

        // Sélection de l'élément input de type fichier
        const imageInput = document.querySelector('input[type="file"]');

        // Ajout d'un gestionnaire d'événements à l'événement de changement de l'input de type fichier
        imageInput.addEventListener('change', function() {
            // Vérifier s'il y a des fichiers sélectionnés
            if (this.files && this.files[0]) {
                const reader = new FileReader();

                // Gestionnaire d'événements pour le chargement de l'image
                reader.onload = function(e) {
                    // Création d'un élément d'image pour afficher l'image téléchargée
                    const uploadedImage = document.createElement('img');
                    uploadedImage.src = e.target.result;
                    uploadedImage.alt = 'Uploaded Image';
                    uploadedImage.classList.add('uploaded-image');

                    // Vérification si une image existe déjà dans la zone
                    const existingImage = document.querySelector('.add-pictures-zone img');
                    if (existingImage) {
                        // Si une image existe déjà, la remplacer par la nouvelle image
                        existingImage.replaceWith(uploadedImage);
                    } else {
                        // Sinon, ajouter l'image téléchargée à la zone
                        document.querySelector('.add-pictures-zone').appendChild(uploadedImage);
                    }
                };

                // Lecture du fichier sélectionné comme une URL de données
                reader.readAsDataURL(this.files[0]);
            }
        });

    }

    // Récupération du token
    var token = localStorage.getItem('token');
    if (token) {
        console.log("Token reçu:", token);
        login = true;
    } else {
        console.log("Aucun token reçu.");
    }

    if (login === true) {
        // Récupérer les éléments ayant l'ID "categorie"
        const categorieElements = document.querySelectorAll('#categorie');
        // Ajouter la classe "hidden" à ces éléments
        categorieElements.forEach(function(element) {
            element.classList.add('hidden');
        });

        loginButton.classList.add('hidden');

        logoutButton.classList.remove('hidden');

        bannerEdition.classList.remove('hidden');

        header.classList.add('padding');

        modifyElement.classList.remove('hidden');

    }

});

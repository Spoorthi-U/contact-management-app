document.addEventListener('DOMContentLoaded', function () {
    initializePhoneNumberInput();
    setupNameValidation();
    setupAddContactButton();
    loadContacts();
});

function initializePhoneNumberInput() {
    const phoneInput = document.querySelector("#phone");
    if (phoneInput) {
        try {
            window.intlTelInput(phoneInput, {
                initialCountry: "auto",
                separateDialCode: false,
                utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.13/js/utils.js"
            });
        } catch (error) {
            console.error('intlTelInput initialization failed:', error);
        }
    } else {
        console.error('Phone input field not found.');
    }
}

function setupNameValidation() {
    document.getElementById('name').addEventListener('input', function () {
        this.value = this.value.replace(/[^a-zA-Z\s-']/g, '');
        this.value = this.value.slice(0, 100);
    });
}

function setupAddContactButton() {
    document.getElementById('addContact').addEventListener('click', function () {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value.trim();
        const gender = document.getElementById('gender').value;
        const email = document.getElementById('email').value;
        const streetAddress = document.getElementById('streetAddress').value;
        const city = document.getElementById('city').value;
        const stateProvince = document.getElementById('stateProvince').value;
        const postalCode = document.getElementById('postalCode').value;
        const country = document.getElementById('country').value;

        if (validateInputs(name, phone, email, streetAddress, city, stateProvince, postalCode, country)) {
            const contact = { name, phone, gender, email, streetAddress, city, stateProvince, postalCode, country };
            fetch('http://localhost:3000/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contact)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(() => {
                loadContacts();
                clearForm();
            })
            .catch(error => console.error('Error:', error));
        }
    });
}

function validateInputs(name, phone, email, streetAddress, city, stateProvince, postalCode, country) {
    const namePattern = /^[A-Za-z\s]{1,100}$/;
    const phonePattern = /^\+?[\d\s\-\(\)]{7,15}$/;
    const emailPattern = /^[\w\.-]+@[\w\.-]+\.\w{2,}$/;
    const addressPattern = /^[A-Za-z0-9\s.,\-#]{5,200}$/;
    const cityPattern = /^[A-Za-z\s]{2,100}$/;
    const stateProvincePattern = /^[A-Za-z\s]{2,100}$/;
    const postalCodePattern = /^[A-Za-z0-9]{3,15}$/;
    const countryPattern = /^[A-Za-z\s]{2,100}$/;

    if (!namePattern.test(name)) {
        alert('Please enter a valid name (alphabetic characters, spaces, hyphens, apostrophes, max 100 characters).');
        return false;
    }

    if (!phonePattern.test(phone)) {
        alert('Please enter a valid phone number (numeric characters, spaces, hyphens, parentheses, 7-15 characters).');
        return false;
    }

    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    if (!addressPattern.test(streetAddress)) {
        alert('Please enter a valid street address (alphanumeric characters, spaces, common punctuation, 5-200 characters).');
        return false;
    }

    if (!cityPattern.test(city)) {
        alert('Please enter a valid city (alphabetic characters, spaces, 2-100 characters).');
        return false;
    }

    if (!stateProvincePattern.test(stateProvince)) {
        alert('Please enter a valid state/province (alphabetic characters, spaces, 2-100 characters).');
        return false;
    }

    if (!postalCodePattern.test(postalCode)) {
        alert('Please enter a valid ZIP/postal code (alphanumeric characters, 3-15 characters).');
        return false;
    }

    if (!countryPattern.test(country)) {
        alert('Please enter a valid country (alphabetic characters, spaces, 2-100 characters).');
        return false;
    }

    return true;
}

function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('gender').value = '';
    document.getElementById('email').value = '';
    document.getElementById('streetAddress').value = '';
    document.getElementById('city').value = '';
    document.getElementById('stateProvince').value = '';
    document.getElementById('postalCode').value = '';
    document.getElementById('country').value = '';
}

function loadContacts() {
    fetch('http://localhost:3000/contacts')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(contacts => {
        const contactList = document.getElementById('contactList');
        contactList.innerHTML = '';
        contacts.forEach(contact => {
            const contactCard = document.createElement('div');
            contactCard.className = 'contact-card';
            contactCard.innerHTML = `
                <h5>${contact.name}</h5>
                <div class="contact-actions">
                    <span class="material-icons view-icon" data-id="${contact.id}">visibility</span>
                    <span class="material-icons edit-icon" data-id="${contact.id}" style="display:none;">edit</span>
                    <span class="material-icons delete-icon" data-id="${contact.id}">delete</span>
                </div>
                <div class="contact-details" style="display: none;">
                    <p><strong>Name:</strong> ${contact.name}</p>
                    <p><strong>Phone:</strong> ${contact.phone}</p>
                    <p><strong>Gender:</strong> ${contact.gender}</p>
                    <p><strong>Email:</strong> ${contact.email}</p>
                    <p><strong>Street Address:</strong> ${contact.streetAddress}</p>
                    <p><strong>City:</strong> ${contact.city}</p>
                    <p><strong>State/Province:</strong> ${contact.stateProvince}</p>
                    <p><strong>ZIP/Postal Code:</strong> ${contact.postalCode}</p>
                    <p><strong>Country:</strong> ${contact.country}</p>
                </div>
            `;
            contactList.appendChild(contactCard);
            addViewFunctionality(contactCard, contact);
            addEditFunctionality(contactCard, contact);
            addDeleteFunctionality(contactCard, contact);
        });
    })
    .catch(error => console.error('Error:', error));
}

function addViewFunctionality(contactCard, contact) {
    const viewIcon = contactCard.querySelector('.view-icon');
    viewIcon.addEventListener('click', function () {
        const contactDetails = contactCard.querySelector('.contact-details');
        const nameElement = contactCard.querySelector('h5');
        const editIcon = contactCard.querySelector('.edit-icon');

        if (contactDetails.style.display === 'none' || contactDetails.style.display === '') {
            contactDetails.style.display = 'block';
            editIcon.style.display = 'inline-block';
            nameElement.style.display = 'none';
            contactDetails.innerHTML = `
                <p><strong>Name:</strong> ${contact.name}</p>
                <p><strong>Phone:</strong> ${contact.phone}</p>
                <p><strong>Gender:</strong> ${contact.gender}</p>
                <p><strong>Email:</strong> ${contact.email}</p>
                <p><strong>Street Address:</strong> ${contact.streetAddress}</p>
                <p><strong>City:</strong> ${contact.city}</p>
                <p><strong>State/Province:</strong> ${contact.stateProvince}</p>
                <p><strong>ZIP/Postal Code:</strong> ${contact.postalCode}</p>
                <p><strong>Country:</strong> ${contact.country}</p>
            `;
        } else {
            contactDetails.style.display = 'none';
            editIcon.style.display = 'none';
            nameElement.style.display = 'block';
        }
    });
}

function addEditFunctionality(contactCard, contact) {
    const editIcon = contactCard.querySelector('.edit-icon');
    editIcon.addEventListener('click', function () {
        document.getElementById('name').value = contact.name;
        document.getElementById('phone').value = contact.phone;
        document.getElementById('gender').value = contact.gender;
        document.getElementById('email').value = contact.email;
        document.getElementById('streetAddress').value = contact.streetAddress;
        document.getElementById('city').value = contact.city;
        document.getElementById('stateProvince').value = contact.stateProvince;
        document.getElementById('postalCode').value = contact.postalCode;
        document.getElementById('country').value = contact.country;

        const addContactButton = document.getElementById('addContact');
        addContactButton.textContent = 'Update Contact';
        addContactButton.removeEventListener('click', addContact);
        addContactButton.addEventListener('click', function updateContact() {
            const updatedContact = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value.trim(),
                gender: document.getElementById('gender').value,
                email: document.getElementById('email').value,
                streetAddress: document.getElementById('streetAddress').value,
                city: document.getElementById('city').value,
                stateProvince: document.getElementById('stateProvince').value,
                postalCode: document.getElementById('postalCode').value,
                country: document.getElementById('country').value
            };

            if (validateInputs(
                updatedContact.name,
                updatedContact.phone,
                updatedContact.email,
                updatedContact.streetAddress,
                updatedContact.city,
                updatedContact.stateProvince,
                updatedContact.postalCode,
                updatedContact.country
            )) {
                fetch(`http://localhost:3000/contacts/${contact.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedContact)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    return response.json();
                })
                .then(() => {
                    loadContacts();
                    clearForm();
                    addContactButton.textContent = 'Add Contact';
                    addContactButton.removeEventListener('click', updateContact);
                    addContactButton.addEventListener('click', addContact);
                })
                .catch(error => console.error('Error:', error));
            }
        });
    });
}

function addDeleteFunctionality(contactCard, contact) {
    const deleteIcon = contactCard.querySelector('.delete-icon');
    deleteIcon.addEventListener('click', function () {
        if (confirm('Are you sure you want to delete this contact?')) {
            fetch(`http://localhost:3000/contacts/${contact.id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                loadContacts();
            })
            .catch(error => console.error('Error:', error));
        }
    });
}

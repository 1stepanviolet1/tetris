import { append_element } from "./dom_functions.js"
import RegistrationForm from "./registration.js";
import Game from "./game.js";

const root = document.getElementById('root');

const title = append_element('h1', root, 'Тетрис');
title.className = "title"

const content = append_element('div', root);
content.id = 'content';

const currentUser = RegistrationForm.getCurrentUser();

if (currentUser) {
    new Game(content);
} else {
    const registration = new RegistrationForm(content);
    
    registration.onSuccess((user) => {
        registration.deleteForm();
        new Game(content);
    });
}


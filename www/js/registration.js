import { create_element, append_element } from "./dom_functions.js";


export default class RegistrationForm {
    constructor(parentElement) {
        this.parent = parentElement;
        this.form = null;
        this.users = this.loadUsers();
        this.init();
    }

    init() {
        this.createForm();
        this.setupEventListeners();
    }

    createForm() {
        this.form = create_element('form');
        this.form.id = "login_form";
        this.form.style.textAlign = "center";

        const _label_username = append_element('label', this.form, "Ник: ");
        _label_username.for = 'username';

        const _input_username = append_element('input', this.form);
        _input_username.id = 'username';

        this.form.append(create_element('br'));

        const _button_submit = append_element('button', this.form, "Играть");
        _button_submit.type = "submit";

        this.parent.append(this.form);
    }

    deleteForm() {
        if (this.form)
            this.form.remove();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    handleSubmit(event) {
        event.preventDefault();
        
        const usernameInput = this.form.querySelector('#username');
        const username = usernameInput.value.trim().toLowerCase();

        let user = null;

        if (!this.userExists(username)) {
            user = this.registerUser(username);
        } else {
            user = this.users.find(user => user.username === username);
        }

        this.setCurrentUser(user);
        this.onRegistrationSuccess(user);

    }

    userExists(username) {
        return this.users.some(user => user.username.toLowerCase() === username.toLowerCase());
    }

    registerUser(username) {
        const new_user = {
            username: username,
            bestScore: 0
        };

        this.users.push(new_user);
        this.saveUsers();

        return new_user;
    }

    setCurrentUser(user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }

    loadUsers() {
        try {
            const users = localStorage.getItem('tetrisUsers');
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
            return [];
        }
    }

    saveUsers() {
        try {
            localStorage.setItem('tetrisUsers', JSON.stringify(this.users));
        } catch (error) {
            console.error('Ошибка сохранения пользователей:', error);
        }
    }

    onRegistrationSuccess(user) {
        const button = this.form.querySelector('button');
        const originalText = button.textContent;
        
        button.textContent = 'Успешно';
        button.disabled = true;

        setTimeout(() => {
            if (this.registrationCallback) {
                this.registrationCallback(user);
            } else {
                alert(`Добро пожаловать, ${user.username}! Начинаем игру...`);
                this.deleteForm();
                // window.location.href = 'game.html';
            }
        }, 1000);
    }

    // Метод для установки колбэка после успешной регистрации
    onSuccess(callback) {
        this.registrationCallback = callback;
    }

    static getCurrentUser() {
        try {
            const user = sessionStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            return null;
        }
    }

    static logout() {
        sessionStorage.removeItem('currentUser');
    }

    static updateUserStats(score) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) return;

            const users = JSON.parse(localStorage.getItem('tetrisUsers') || '[]');
            const userIndex = users.findIndex(u => u.username === currentUser.username);
            
            if (userIndex !== -1) {
                users[userIndex].bestScore = Math.max(users[userIndex].bestScore, score);
                
                localStorage.setItem('tetrisUsers', JSON.stringify(users));
                
                // Обновляем текущего пользователя в сессии
                sessionStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
            }
        } catch (error) {
            console.error('Ошибка обновления статистики:', error);
        }
    }

    static getLeaderboard(limit = 5) {
        try {
            const users = JSON.parse(localStorage.getItem('tetrisUsers') || '[]');
            return users
                .sort((a, b) => b.bestScore - a.bestScore)
                .slice(0, limit);
        } catch (error) {
            return [];
        }
    }
}
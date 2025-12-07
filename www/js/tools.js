import { create_element, append_element } from "./dom_functions.js"

function add_login_form(parent) {
    const _login_form = create_element('form');
    _login_form.id = "login_form";

    const _label_username = create_element('label', "Ник: ");
    _label_username.for = 'username';
    _login_form.append(_label_username);

    const _input_username = create_element('input');
    _input_username.id = 'username';
    _login_form.append(_input_username);

    _login_form.append(create_element('br'));

    const _button_submit = create_element('button', "Играть");
    _button_submit.type = "submit";
    _login_form.append(_button_submit);

    parent.append(_login_form);
    return _login_form;

}


export {
    add_login_form
};


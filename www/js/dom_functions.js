
function create_element(teg, content="") {
    const _new_el = document.createElement(teg);
    _new_el.textContent = content;
    return _new_el;
}

function append_element(teg, parent, content="") {
    const _new_el = create_element(teg, content);
    parent.append(_new_el);
    return _new_el;
}

function prepend_element(teg, parent, content="") {
    const _new_el = create_element(teg, content);
    parent.prepend(_new_el);
    return _new_el;
}

export {
    create_element,
    append_element,
    prepend_element
};


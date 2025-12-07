import { append_element } from "./dom_functions.js";
import RegistrationForm from "./registration.js";

export default class TableOfRecords {
    constructor(parent) {
        this.parent = parent;
        this.container = null;
        this.table_of_records = null;
    }

    show() {
        this.delete();

        this.container = append_element('div', this.parent);
        this.container.className = "record-container"

        append_element('hr', this.container);
        append_element('h2', this.container, "Таблица рекордов:");

        const leaders = RegistrationForm.getLeaderboard();
        this.table_of_records = append_element('ol', this.container)
        
        for (let user of leaders) {
            append_element('li', this.table_of_records, `${user.username} (${user.bestScore})`);
        }

        append_element('hr', this.container);
    }

    delete() {
        if (this.container)
            this.container.remove();
    }
}


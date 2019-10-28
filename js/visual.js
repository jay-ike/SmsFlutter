var db = new Dexie("Etudiants");

db.version(1).stores({
    etudiant: "++_id,nom,prenom,ident,tel,whatsapp,filière"
});
db.open();
window.db = db;

var $ = function (Selector, parent) {
    return (parent ? parent : document).querySelector(Selector);
};
async function génerer() {
    let a;
    await db.etudiant.orderBy('_id').last(e => {
        a = e._id;
    });
    var d = new Date();
    return "CIUD" + d.getFullYear().toFixed().substr(2, 2) + (a + 1);
}

$("#file").addEventListener("click", event => {
    let csv = "";
    event.preventDefault();
    db.etudiant.toArray(etud => {
        etud.forEach(e => {
            csv +=
                e.nom +
                "," +
                e.prenom +
                "," +
                e.tel +
                "," +
                e.whatsapp +
                "," +
                e.filière +
                "\n";
        });
        génerer().then(val => {
            download("Etudiants-" + val + ".csv", csv);
        });
    }).catch(e => {
        console.log(e);
    });
});

function download(filename, data) {
    var el = document.createElement("a");
    el.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(data)
    );
    el.setAttribute("download", filename);
    el.style.display = "none";
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
}

function vcfInfo(etudiant) {
    let vcf = "BEGIN:VCARD\nVERSION:2.1\n";
    vcf +=
        "N:" +
        etudiant.nom.split(" ")[0] +
        ";" +
        etudiant.prenom.split(" ")[0] +
        ";;;\n" +
        "FN:" +
        etudiant.nom.split(" ")[0] +
        " " +
        etudiant.prenom.split(" ")[0] +
        "\n" +
        "TEL;CIUD-" +
        ";PREF:" +
        etudiant.whatsapp +
        "\n" +
        "EMAIL:" +
        etudiant.email +
        "\n" +
        "END:VCARD\n";
    return vcf;
}

$("#vcf").addEventListener("click", e => {
    let vcf = "";
    db.etudiant.toArray(etud => {
        etud.forEach(stud => {
            vcf += vcfInfo(stud);
        });
        génerer().then(val => {
            download("Etudiants-" + val + ".vcf", vcf);
        });
    });
});

class Row {
    constructor(data, db) {
        this.id = data._id ? data._id : null;
        this.root = document.createElement('div');
        this.root.classList.add('row');
        this.prevVal = '';
        this.db = db;
        this.data = data;
    }
    addCell() {
        for (let i in this.data) {
            if (['nom', 'prenom', 'tel', 'whatsapp', 'filière'].indexOf(i) >= 0) {
                let td = document.createElement('div');
                td.classList.add('visual-container');
                let input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.setAttribute('readonly', 'true');
                input.style.border = 'none';
                input.style.background = 'transparent';
                input.value = this.data[i];
                input.name = i;
                let editor = document.createElement('i');
                editor.classList.add('field-unlocker');
                editor.classList.add('icon-lock-closed');
                editor.addEventListener('click', () => {
                    input.style.border = '.1em solid dimgray';
                    input.style.background = 'beige';
                    editor.classList.remove('icon-lock-closed');
                    editor.classList.add('icon-lock-open');
                    input.readOnly = false;
                    input.focus();
                });
                let val = this;
                input.onfocus = () => {
                    val.prevVal = input.value;
                };
                input.onblur = () => {
                    if (input.value != val.prevVal) {
                        val.db.etudiant.where('_id').equals(val.id).modify(value => {
                            value[input.name] = input.value;
                        });
                    }
                    input.readOnly = true;
                    input.style.border = 'none';
                    input.style.background = 'transparent';
                    editor.classList.remove('icon-lock-open');
                    editor.classList.add('icon-lock-closed');
                };

                td.appendChild(input);
                td.prepend(editor);
                this.root.appendChild(td);
            } else {
                continue;
            }
        }

    }

    addRow(table) {
        let td = document.createElement('div');
        let i = document.createElement('i');
        i.classList.add('row-canceller');
        let val = this;
        i.onclick = () => {
            let choice = window.confirm('voulez vous vraiment supprimer cette ligne ?');
            if (choice) {
                this.db.etudiant.where('_id').equals(val.id).delete().then(v => {
                    val.root.remove();
                    alert('ces données ont étés supprimés avec succès !!');
                });
            }
        };
        td.appendChild(i);
        this.root.prepend(td);
        table.appendChild(this.root);
    }
}

window.onload = () => {
    let table = $('div.grid-container');
    if (table) {
        let header = document.createElement('div');
        header.classList.add('grid-header');
        let body = document.createElement('div');
        body.classList.add('grid-body');
        let tr = document.createElement('div');
        tr.classList.add('row');
        let th;
        th = document.createElement('div');
        tr.prepend(th);
        for (var i in db.etudiant.schema.idxByName) {
            if (['nom', 'prenom', 'tel', 'whatsapp', 'filière'].indexOf(i) >= 0) {
                th = document.createElement('div');
                th.innerText = i;
                tr.appendChild(th);
            }
        }
        header.appendChild(tr);
        table.appendChild(header);
        table.appendChild(body);
        db.etudiant.toArray(e => {
            e.forEach(elem => {
                let row = new Row(elem, db);
                row.addCell(elem);
                row.addRow(body);
            });
        });
    } else {
        console.log('pas de table à visualiser !!');
    }

};
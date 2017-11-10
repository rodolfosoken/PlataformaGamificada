class Aluno {
    constructor(nome, insignias) {
        this.nome = nome;
        this.insignias = insignias;
    }

    toHtml() {
    	var insigniasHtml = "";
    	
    	for (var i = 0; i < this.insignias.length; i++)
    		insigniasHtml += this.insignias[i].toHtml();
    	
        var stringAluno = "<div class=\"row align-items-center rowAluno\">" +
            "<div class=\"col-md-1\">" +
            "<img src=\"images/icon-user.png\">" +
            " </div> <div class=\"col-md nome\">" +
            "Nome: " + this.nome + " " +
            "</div>" +
            insigniasHtml+
            "</div>";
        return stringAluno;
    }
}

class Insignia{
	constructor(nameFile){
		this.nameFile = nameFile;
	}

	toHtml(){
			return "<div class=\"col-md-2\">" +
            "<img src=\"images/"+this.nameFile+"\" class=\"insignia\">" +
            " </div>"
	}
}

var alunos = [];

//procura o nome do aluno inserido no campo de busca
function procurarAluno() {

    var nomeInserido = $("#nomePesquisa").val();
    var naoEncontrado = true;

    if (nomeInserido) {
        alunosAchados = []
        var nomes = document.getElementsByClassName("nome");

        for (var i = 0; i < alunos.length; i++) {
            if (alunos[i].nome.includes(nomeInserido)) {
                alunosAchados.push(alunos[i]);
                naoEncontrado = false;
            }
        }

        if (naoEncontrado) {
            alert("Não foi possível encotrar o seu nome");
        } else {
            var htmlString = "";
            for (var i = 0; i < alunosAchados.length; i++)
                htmlString += alunosAchados[i].toHtml();
            $("#quadroDeAlunos").html(htmlString);
            $(".insignia").removeClass("animated flip");
            $(".insignia").addClass("animated flip");
        }

    } else {
        alert("O nome não pode ser vazio.");
    }

}


function processarCSV(data){
	alert(data);

}

//executa os metodos após o carregamento da página
$(document).ready(function() {
    //reseta campo de pesquisa
    $("#nomePesquisa").val("");

    var insigniaVermelha = new Insignia("medalhaVermelha.png");
    var insigniaColorida = new Insignia("medalhaColorida.png");
    var insigniaTrofeu = new Insignia("trofeu-01.png");

    //preenche o quadro de alunos
    for (var i = 1; i <= 5; i++) {
        var aluno = new Aluno("Aluno " + i, [insigniaTrofeu, insigniaColorida, insigniaVermelha]);
        alunos.push(aluno);
        $("#quadroDeAlunos").append(aluno.toHtml());
    } //fim do for

    //mecanismo de busca
    $("#procurarAluno").click(function() {
        procurarAluno();
    });

    $("input").keydown(function(e) {
        if (e.which == 13) {
            $("#procurarAluno").click(procurarAluno());

        }
    });

    //faz a animacao das insignias
    $(".insignia").addClass("animated flip");


    $.ajax({
    	url:'arquivo.csv',
    	dataType:'csv'
    }).done(processarCSV);

    // //leitura de csv
    //  var request = new XMLHttpRequest();
    //     request.open("GET", "arquivo.csv", false);
    //     request.send(null);
    //     var lines = request.responseText.split(",");
    //     alert(lines);
   
});
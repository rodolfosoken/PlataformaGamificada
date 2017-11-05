class Aluno {
    constructor(nome) {
        this.nome = nome;
    }

    toHtml() {
        var stringAluno = "<div class=\"row align-items-center rowAluno\">" +
            "<div class=\"col-1\">" +
            "<img src=\"images/icon-user.png\">" +
            " </div> <div class=\"col nome\">" +
            "Nome: " + this.nome + " " +
            "</div>" +
            "<div class=\"col-2\">" +
            "<img src=\"images/trofeu-01.png\" class=\"insignia\">" +
            " </div>" +
            "<div class=\"col-2\">" +
            "<img src=\"images/medalhaVermelha.png\" class=\"insignia\">" +
            " </div>" +
            "</div>";
        return stringAluno;
    }
}

var alunos = [];

$(document).ready(function() {
	//reseta campo de pesquisa
	$("#nomePesquisa").val("");

    //teste que preenche de forma dinamica o quadro de alunos
    for (var i = 1; i <= 5; i++) {
        var aluno = new Aluno("Aluno " + i);
        alunos.push(aluno);
        $("#quadroDeAlunos").append(aluno.toHtml());
    } //fim do for

    //mecanismo de busca
    $("#procurarAluno").click(function() {

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
            }else{
            	var htmlString = "";
            	for (var i = 0; i < alunosAchados.length; i++) 
            		htmlString += alunosAchados[i].toHtml();  
            	$("#quadroDeAlunos").html(htmlString);
            }

        } else {
            alert("O nome não pode ser vazio.");
        }

    });

    //faz a animacao das insignias
    $(".insignia").addClass("animated flip");
});
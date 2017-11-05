class Aluno {
	constructor(nome){
		this.nome = nome;
	}

	toString(){
		var stringAluno = "<div class=\"row align-items-center rowAluno\">"+
                    "<div class=\"col-1\">"+
                        "<img src=\"images/icon-user.png\">"+
                   " </div> <div class=\"col nome\">"+
                        "Nome: "+this.nome+" "+
                    "</div>"+
                    "<div class=\"col-2\">"+
                        "<img src=\"images/trofeu-01.png\" class=\"insignia\">"+
                   " </div>"+
                    "<div class=\"col-2\">"+
                        "<img src=\"images/medalhaVermelha.png\" class=\"insignia\">"+
                   " </div>"+
                "</div>";
        return stringAluno;
	}
}

var alunos = [];

$(document).ready(function(){
	
	//teste que preenche de forma dinamica o quadro de alunos
	for (var i = 1 ; i <= 5; i++) {
		var aluno = new Aluno("Aluno "+i);
		alunos.push(aluno);
		$("#quadroDeAlunos").append(aluno.toString());
	}//fim do for
	
	//mecanismo de busca, apenas verifica se o nome consta na lista
	//============= nao foi terminado ========
	$("#procurarAluno").click(function(){
		var nomeInserido = $("#nomePesquisa").val();
		var nomes = document.getElementsByClassName("nome");
		var naoEncontrado = true;

		for (var i = 0; i < nomes.length; i++) {
			if (nomes[i].innerHTML.includes(nomeInserido)){
				alert("Nome Encontrado em Aluno nº : "+i);
				encontrado = !naoEncontrado;
			} 
		}
		if (naoEncontrado) {
			alert("Não foi possível encotrar o seu nome");
		}

	});

	//faz a animacao das insignias
	$(".insignia").addClass("animated flip");
});
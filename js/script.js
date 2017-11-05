$(document).ready(function(){
	for (var i = 0 ; i < 5; i++) {
		$("#quadroDeAlunos").append(
		"<div class=\"row align-items-center rowAluno\">"+
                    "<div class=\"col\">"+
                        "<img src=\"images/icon-user.png\">"+
                   " </div> <div class=\"col\">"+
                        "Nome: Aluno "+i+" do Quadro "+
                    "</div>"+
                    "<div class=\"col-2\">"+
                        "<img src=\"images/trofeu-01.png\" class=\"insignia\">"+
                   " </div>"+
                    "<div class=\"col-2\">"+
                        "<img src=\"images/medalhaVermelha.png\" class=\"insignia\">"+
                   " </div>"+
                "</div>"

		);
	}
	
	$(".insignia").addClass("animated flip");
});

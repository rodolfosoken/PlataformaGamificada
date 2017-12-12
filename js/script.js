
//classe aluno recebe o nome do aluno e uma lista de insignias
class Aluno {
    constructor(nome, insignias) {
        this.nome = nome;
        this.insignias = insignias;
    }

/* 
    Para ser exibido, cada objeto aluno precisa ser convertido 
    em uma string html para que esta string entao seja inserida dentro da 
    div "#quadroDeAlunos" pelo metodo "processarCSV(data)" assim, 
    para qualquer info adicional a ser inserida do aluno, 
    vc deve modificar este metodo

    O processo ocorre da mesma maneira para as insignias
    as quais são recebidas em formato de lista no metodo construtor do aluno.
 */
    toHtml() {
    	var insigniasHtml = "";
    	
        //itera sobre a lista de insignias recebida
        //convertendo as insignias em html
    	for (var i = 0; i < this.insignias.length; i++)
    		insigniasHtml += this.insignias[i].toHtml();
    	
        //Apos todas as insignias serem convertidas em uma string html,
        //ela eh concatenada na string html do aluno
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

//classe insignia recebe como parametro o nome do arquivo de imagem
class Insignia{
	constructor(nameFile){
		this.nameFile = nameFile;
	}

    //retorna o trecho de html correspondente 
    //a representacao visal desta insignia
	toHtml(){
			return "<div class=\"col-md-2\">" +
             "<a href=\"quadro.html\">"+
            "<img src=\"images/"+this.nameFile+"\" class=\"insignia\">" +
            "</a>"+
            " </div>";
	}
}

var alunos = [];

//procura o nome do aluno inserido no campo de busca
function procurarAluno() {

    var nomeInserido = $("#nomePesquisa").val();
    var naoEncontrado = true;

    if (nomeInserido) { //caso o campo de busca nao esteja nulo
        //procurar pelo nome do aluno
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

    } else {//caso o campo de busca esteja vazio
        //preencher o quadro com todos os alunos
        var htmlString = "";
        for (var i = 0; i < alunos.length; i++) {
            htmlString += alunos[i].toHtml();
        }
        $("#quadroDeAlunos").html(htmlString);
    }

}


//funcao que processa o arquivo csv
function processarCSV(data){
    //indica quais os dados a serem processados e que a 
    //primeira liha do arquivo sao os nomes das colunas
	var dadosProcessados = Papa.parse(data,{header:true});
    console.log(dadosProcessados);
    var insigniaVermelha = new Insignia("medalhaVermelha.png");
    var insigniaColorida = new Insignia("medalhaColorida.png");
    var insigniaTrofeu = new Insignia("trofeu-01.png");
    for (var i = dadosProcessados.data.length - 1; i >= 0; i--) {
        var insignias=[];
        var total = 1*dadosProcessados.data[i].Total;
        if(total >= 5 && total < 20){
            insignias = [insigniaVermelha];
        }else if (total >= 20 && total < 30){
            insignias = [insigniaVermelha,insigniaColorida]; 
        }else if (total >= 30){
            insignias = [insigniaVermelha, insigniaColorida, insigniaTrofeu];
        }
        var aluno = new Aluno(dadosProcessados.data[i].Nome, insignias, dadosProcessados.data[i].Total);
        alunos.push(aluno);
        $("#quadroDeAlunos").append(aluno.toHtml());
    }
     //faz a animacao das insignias
    $(".insignia").addClass("animated flip");

}

//executa os metodos após o carregamento da página
$(document).ready(function() {
    //reseta campo de pesquisa
    $("#nomePesquisa").val("");

    //preenche o quadro de alunos
    $.ajax({
        url:'arquivo.csv',
        dataType:'text',
        success: function(data){
            processarCSV(data);
        }
    });

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
   
});
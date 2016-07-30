(function () {
    'use strict';

    //prepare underscore templates
    var templates = {};
    $('[data-template]').each(function () {
        var template = $(this).text();
        templates[$(this).data('template')] = _.template(template);
    });

    var state = {
        currentQuestion: 0,
        questions: null,
        scoreCounter: 0
    };

    var elements = {
        viewContainer: $('#view-container')
    };

    function getQuestions () {
        return $.getJSON('data/questions.json').then(function (data) {
            return data.questions;
        });
    }

    function renderCurrentQuestion () {
        var question = state.questions[state.currentQuestion];
        var $questionForm = $(templates.question(question));
        elements.viewContainer.html($questionForm);

        $questionForm.on('submit', function (evt) {
            evt.preventDefault();
            var $selectedAnswer = $questionForm.find('[name="answer"]:checked');

            if($selectedAnswer.length) {
                $questionForm.find('input[type=radio], button[type=submit]').attr('disabled', true);
                checkAnswer(question, $selectedAnswer);
            }
        });

        $questionForm.find('[data-hook="next"]').on('click', function () {
            state.currentQuestion += 1;
            renderCurrentQuestion();
        });
    }

    function checkAnswer (question, $selectedAnswer) {
        var selectedAnswerId = parseInt($selectedAnswer.val());
        var selectedAnswer = _.find(question.answers, {id: selectedAnswerId});
        var correctAnswer = _.find(question.answers, 'isCorrect');
        var isCorrect = selectedAnswerId === correctAnswer.id;

        if(isCorrect) {
            state.scoreCounter += 1;
        }

        $selectedAnswer.parent().addClass('answer--' + (isCorrect ? 'correct' : 'false'));

        elements.viewContainer.find('[data-hook="feedback"]')
            .text(selectedAnswer.feedback)
            .addClass('question__feedback--active')
            .addClass('question__feedback--' + (isCorrect ? 'correct' : 'false'));

        elements.viewContainer.find('[data-hook="submit"]').removeClass('question__submit--active');

        if(state.currentQuestion < state.questions.length - 1) {
            elements.viewContainer.find('[data-hook="next"]').addClass('question__next--active');
        }
        else {
            renderConclusion();
        }
    }

    function renderConclusion () {
        var html = templates.conclusion({
            score: state.scoreCounter,
            count: state.questions.length
        });

        elements.viewContainer.html(html);
    }

    function bootstrap () {
        getQuestions().then(function (questions) {
            state.questions = questions;
            renderCurrentQuestion();
        });
    }

    bootstrap();
})();

/* eslint-global previews */
$(function () {
    const url = window.location.href.match(/[0-9a-zA-Z]+$/);
    let surveyData;
    $.ajax({
        method: "GET",
        async: true,
        url: "/api/" + url,
        beforeSend: function () {

            // something to confuse the user here
        },
        error: function (error) {
            const body = $("body");
            const errorElement = document.createElement("h1");
            body.append(errorElement);
            $(errorElement).html(error.responseJSON.message)
                .css("text-align", "center");
        },
        success: function (survey) {
            surveyData = survey;
            const surveyNameWrapper = document.createElement("div");
            const surveyCatWrapper = document.createElement("div");
            const surveyDateWrapper = document.createElement("div");

            const surveyNameParagraph = document.createElement("p");
            const surveyCatParagraph = document.createElement("p");
            const surveyDateParagraph = document.createElement("p");

            const surveyNameSpan = document.createElement("span");
            const surveyCatSpan = document.createElement("span");
            const surveyDateSpan = document.createElement("span");

            $(surveyNameParagraph).html("Survey: ");
            $(surveyCatParagraph).html("Category: ");
            $(surveyDateParagraph).html("Created at: ");

            $(surveyNameWrapper).addClass("col-md-4", "survey-name");
            $(surveyCatWrapper).addClass("col-md-4", "survey-category");
            $(surveyDateWrapper).addClass("col-md-4", "survey-date");

            $(surveyNameWrapper)
                .append(surveyNameParagraph)
                .append(surveyNameSpan);
            $(surveyCatWrapper)
                .append(surveyCatParagraph)
                .append(surveyCatSpan);
            $(surveyDateWrapper)
                .append(surveyDateParagraph)
                .append(surveyDateSpan);

            $("#initial").append(surveyNameWrapper)
                .append(surveyCatWrapper)
                .append(surveyDateWrapper);

            $(".survey-name p span").text(survey.name);
            $(".survey-category p span").text(survey.Category.name);
            $(".created-date p span").text(survey.createdAt);
            const form = document.getElementById("submit-survey");

            survey.surveyContentData.forEach(function (element, index) {
                const row = document.createElement("div");
                const formGroup = document.createElement("div");

                row.className = "row";
                formGroup.className = "form-group";

                let newElement;
                row.appendChild(formGroup);
                if (element.questionData.type === "slider") {
                    newElement = window.previews.sliderPreview(element, index + 1);
                    formGroup.appendChild(newElement);
                } else if (element.questionData.type === "multiple-choice") {
                    newElement = window.previews.multipleChoicePreview(element, index + 1);
                    formGroup.className += " checkbox-group";
                    formGroup.appendChild(newElement);
                } else if (element.questionData.type === "single-choice") {
                    newElement = window.previews.singleChoicePreview(element, index + 1);
                    formGroup.appendChild(newElement);
                } else if (element.questionData.type === "single-textbox") {
                    newElement = window.previews.singleTextboxPreview(element, index + 1);
                    formGroup.appendChild(newElement);
                } else if (element.questionData.type === "emojis") {
                    newElement = window.previews.emojisChoicePreview(element, index + 1);
                    formGroup.appendChild(newElement);
                }
                form.appendChild(row);
            });

            window.previews.injectSliders(window.previews._slidersIds);

            const submitBtn = document.createElement("button");
            submitBtn.id = "submit-survey-btn";
            submitBtn.className = "btn btn-success";
            submitBtn.setAttribute("type", "submit");
            submitBtn.setAttribute("value", "Submit");
            submitBtn.innerHTML = "Submit";
            form.appendChild(submitBtn);
        }
    });

    const validateCheckbox = function (requiredCheckbox) {
        let flag = true;
        requiredCheckbox.each(function (index, checkbox) {
            const selected = $(checkbox).children(".checkbox").find("input:checked");
            if (selected.length === 0) {
                flag = false;
            }
        });
        return flag;
    };

    $("#submit-survey").submit(function (e) {
        e.preventDefault();
        const requiredCheckbox = $(".checkbox-group .required");
        const validate = validateCheckbox(requiredCheckbox);
        if (!validate) {
            console.log("error!");
            return false;
        }

        const serialize = $("#submit-survey").serializeArray();

        const surveyDataObj = {
            surveyId: surveyData.id,
            name: surveyData.name,
            userId: surveyData.user_id
        };

        $.ajax({
            method: "POST",
            async: true,
            url: "/submit",
            data: {
                serialize,
                surveyDataObj
            },
            error: function (error) {
                console.log(error);
            },
            success: function (resolve) {
                console.log("Success");
            }
        });

        return false;
    });
});
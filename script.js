
let homeworkList = $.jStorage.get('hw') || []

const emptySave = {
    options: {}
}

$.each($('.option-display div input'), (i, e) => {
    e = $(e)
    emptySave.options[e.attr('id')] = e.attr("data-default") === 'true' ? true : false;

})

let hwt = $.jStorage.get("HWT") || emptySave

$.each($('.option-display div input'), (i, e) => {
    e = $(e)
    if (hwt.options[e.attr('id')]) e.attr("checked", 'checked')
    e.on("click", () => {
        e.attr("checked", e.attr("checked") ? false : true)
    })
})

const updateDayAndSave = () => {
    $('.y').html(new Date().getFullYear() - 1911)
    $('.m').html(new Date().getMonth() + 1)
    $('.d').html(new Date().getDate())
    const getDay = () => {
        const day = new Date().getDay()
        return ['日', '一', '二', '三', '四', '五', '六'][day]
    }

    $('.day').html(getDay())

    $.jStorage.set("HWT", hwt)

}

updateDayAndSave()

setInterval(updateDayAndSave, 10000)

// i have committed a warcrime
let to全形 = [
    {
        i: '(',
        o: '（'
    },
    {
        i: ')',
        o: '）'
    },
    {
        i: '[',
        o: '［'
    },
    {
        i: ']',
        o: '］'
    },
    {
        i: '{',
        o: '｛'
    },
    {
        i: '}',
        o: '｝'
    },
    {
        i: '~',
        o: '～'
    }
]

function splitWithMatches(str, regex) {
    let result = [];
    let lastIndex = 0;
    let match;

    const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');

    while ((match = globalRegex.exec(str)) !== null) {
        if (match.index > lastIndex) {
            result.push(str.slice(lastIndex, match.index));
        }
        result.push(match[0]);
        lastIndex = globalRegex.lastIndex;
    }

    if (lastIndex < str.length) {
        result.push(str.slice(lastIndex));
    }

    let matchOnly = [...str.matchAll(globalRegex)].map(a => a = a[0]);


    return {
        result,
        matchOnly,
        isFirstOneAMatch: matchOnly[0] === result[0],
    };
}

const toVerticalWords = () => {
    $.each($('.hw'), (i, hw) => {
        const hwText = homeworkList[i].text;
        const hwDisplay = hw.querySelector('.hw-text')
        let regexp = /[!-z]+/g;
        if (hwt.options["smaller-space"]) regexp = /[ -z]+/g;
        let func = splitWithMatches(hwText, regexp),
            { result, isFirstOneAMatch } = func;
        hwDisplay.innerHTML = ''
        // this feature complicated af
        // it's all just regex patterns
        if (hwt.options['escape-char']) {
            result.forEach((a, i) => {
                if (a.match(/\\h(?!\\)[\s\S]*/g)) {
                    let arrayUntilEnd = result.slice(i + 1)
                    let end = arrayUntilEnd.find(v => v.match(/[\s\S]*\\h\\[\s\S]*/g))
                    if (!end) return;
                    arrayUntilEnd = arrayUntilEnd.slice(0, arrayUntilEnd.indexOf(end))
                    result[i] = a + arrayUntilEnd.join("") + end
                    const temp = (index) => {
                        let e = !result[i + index].match(/[\s\S]*\\h\\/g)
                        if (!e) delete result[i + index]
                        return e
                    }
                    for (let index = 1; temp(index); index++) {
                        delete result[i + index]
                    }
                }
            })
        }
        result = result.filter(a => a !== undefined)
        if (hwt.options['escape-char']) result = result.map(a => a.replaceAll('\\n', '\n'))
        result.forEach((a, i) => {
            if (
                (!(i % 2) && isFirstOneAMatch) || (i % 2 && !isFirstOneAMatch) ||
                (a.match(/\\h[\s\S]+\\h\\/g) && hwt.options['escape-char'])
            ) {
                if (hwt.options["unsafe-input"]) return hwDisplay.innerHTML += `<b class="num unbold">${a}</b>`;
                let b = document.createElement('b');
                if (hwt.options['escape-char'] && a.match(/\\h[\s\S]+\\h\\/g)) {
                    a = a.replaceAll('\\h\\', '\n')
                    if (a.match(/[\s\S]+\\h/g)) a = a.replaceAll('\\h', '\n')
                    else a = a.replaceAll('\\h', '')
                }
                b.innerText = a;
                b.classList.add("num");
                b.classList.add('unbold');
                hwDisplay.append(b);
            } else {
                if (hwt.options["unsafe-input"]) return hwDisplay.innerHTML += a;
                hwDisplay.append(a)
            }
        })
    })
}

const initOptionModal = (hwI) => {
    let hwText = homeworkList[hwI].text
    $('.remove, .edit, .color, .left, .right').off()
    $(`.remove`).on('click', () => {
        alertModal('確定刪除作業?', [
            {
                text: '確定',
                onclick: () => {
                    homeworkList = homeworkList.filter((hw) => hw.text !== hwText)
                    $('.hw-container').empty();
                    $.jStorage.set('hw', homeworkList)
                    homeworkList.forEach((hw) => addHW(hw))
                    $('.hw-options').removeClass('show')
                }
            },
            {
                text: '取消',
                onclick: () => {
                    // 按下取消時不做任何事情 - 那個ai
                }
            }
        ])
    })
    $(`.edit`).on('click', () => {
        $('.edit-hw').addClass('show')
        $('.edit-input').val(hwText)
        $('.edit-input').focus()
        $('.save-btn')[0].onclick = () => {
            let input = $('.edit-input').val().trim()
            if (!input) return alert('請在裡面打東西!');
            if (hwt.options['to全形']) {
                to全形.forEach(char => {
                    input = input.replaceAll(char.i, char.o)
                })
            }
            if (homeworkList.find((hw) => hw.text === input)) {
                return $('.edit-hw').removeClass('show')
            }
            homeworkList[hwI].text = input
            $('.hw-container').empty();
            $.jStorage.set('hw', homeworkList)
            homeworkList.forEach((hw) => addHW(hw))
            hwText = input
            toVerticalWords()
            $('.edit-hw').removeClass('show')
        }
    })
    $('.color').val(homeworkList[hwI].color)
    $(`.color`).on('change', () => {
        let color = $(`.color`).val()
        homeworkList[hwI].color = color
        $.jStorage.set('hw', homeworkList)
        console.log(color)
        $(`.hw[--data-index="${hwI}"]`).css('color', color)
    })
    $('.left').on('click', () => {
        if (hwI < homeworkList.length - 1) {
            let temp = homeworkList[hwI]
            homeworkList[hwI] = homeworkList[hwI + 1]
            homeworkList[hwI + 1] = temp
            $('.hw-container').empty()
            homeworkList.forEach((hw) => addHW(hw))
            hwI++
            $.jStorage.set('hw', homeworkList)
            toVerticalWords()
        }
    })
    $('.right').on('click', () => {
        if (hwI > 0) {
            let temp = homeworkList[hwI]
            homeworkList[hwI] = homeworkList[hwI - 1]
            homeworkList[hwI - 1] = temp
            $('.hw-container').empty()
            homeworkList.forEach((hw) => addHW(hw))
            hwI--
            $.jStorage.set('hw', homeworkList)
            toVerticalWords()
        }
    })
}

const addHW = (hw) => {
    let input = hw.text
    const hwI = homeworkList.indexOf(homeworkList.find((hw) => hw.text === input))
    let eleText =
        `<div class="hw" --data-index="${hwI}" ><b class="num">${hwI + 1}.</b><b class="hw-text"></b><button class="hw-options" --data-index="${hwI}"><i class="fa-solid fa-gear" aria-hidden="true"></i></button></div>`
    $('.hw-container').append(eleText)
    if (hwt.options['unsafe-input']) $(`.hw[--data-index="${hwI}"] .hw-text`).html(input)
    else $(`.hw[--data-index="${hwI}"] .hw-text`).text(input)
    $(`.hw-options[--data-index="${hwI}"]`).on('click', () => {
        $('.hw-options').addClass('show')
        initOptionModal(hwI)
    })
    if (homeworkList[hwI]) {
        $(`.color[--data-index="${hwI}"]`).val(homeworkList[hwI].color)
        $(`.hw[--data-index="${hwI}"]`).css('color', homeworkList[hwI].color)
    }
    toVerticalWords()
}

const addInput = (input) => {
    if (!input) return alert('請在裡面打東西!');
    if (hwt.options['to全形']) {
        to全形.forEach(char => {
            input = input.replaceAll(char.i, char.o)
        })
    }
    if (homeworkList.find((hw) => hw.text === input)) return alert('不可以重複!');
    homeworkList.push({
        text: input,
        color: '#ffffff',
    })
    $.jStorage.set('hw', homeworkList)
    addHW(input)
    $('.hw-input')[0].value = ''
    $('.hw-container').empty();
    homeworkList.forEach((hw) => addHW(hw))
}

$('.add-btn').on('click', () => {
    let input = $('.hw-input').val().trim()
    addInput(input)
})

homeworkList.forEach((hw) => addHW(hw))

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if ($('.edit-hw').hasClass('show')) return $('.save-btn')[0].click();
        if ($('.fast-enter').hasClass('show')) return $('.submit-fe')[0].click();
        $('.add-btn')[0].click()
    }
})

$('.clear').on('click', () => {
    alertModal('確定清除聯絡簿?', [
        {
            text: '確定',
            onclick: () => {
                $.jStorage.deleteKey('hw');
                $('.hw-container').empty();
                homeworkList = [];
                toVerticalWords();
            }
        },
        {
            text: '取消',
            onclick: () => {
                // 按下取消時不做任何事情 - 那個ai
            }
        }
    ])
})

let isPageRange = true
$('.custom-range').hide()

const trm = () => {
    isPageRange = !isPageRange
    if (isPageRange) {
        $('.page-range').show();
        $('.custom-range').hide();
    } else {
        $('.page-range').hide();
        $('.custom-range').show();
    }
    $('.page-range input, #custom-range-input').val('')
}

$('.submit-fe').on('click', () => {
    if (!$('select#type').val() || !$('select#subject').val() || !$('select#choose-book-type').val()) return alert('作業未輸入完整!')
    if ($('select#type').val() === ' ') $('select#type').val('')
    if (isPageRange) {
        if (isNaN($('#page-from').val())) return alert('作業未輸入完整!')
        let text = $('select#type').val() + $('select#subject').val() + $('select#choose-book-type').val() + "P." + $('#page-from').val()
        if ($('#page-to').val() && $('#page-from').val() !== $('#page-to').val()) text += "~P." + $('#page-to').val()
        addInput(text)
    } else {
        if (!$('#custom-range-input').val()) return alert('作業未輸入完整!')
        let text = $('select#type').val() + $('select#subject').val() + $('select#choose-book-type').val() + $('#custom-range-input').val()
        addInput(text)
    }
    $('select#type, select#subject, select#choose-book-type, #page-to, #page-from, #custom-range-input').val('')
    $('.fast-enter').removeClass('show')
    return;
})
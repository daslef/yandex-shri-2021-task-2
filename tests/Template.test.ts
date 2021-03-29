import DataTemplate from '../src/dataTemplate'
import { VoteData, StoryInterface } from '../src/types/stories'


test('should return vote slide', () => {

    const subtitle = "Последний вагон"

    const users = [
        {"id": 7, "name": "Дмитрий Андриянов", "avatar": "7.jpg", "valueText": "306 голосов"},
        {"id": 8, "name": "Александр Иванков", "avatar": "8.jpg", "valueText": "305 голосов"},
        {"id": 5, "name": "Александр Николаичев", "avatar": "5.jpg", "valueText": "284 голоса"},
        {"id": 4, "name": "Вадим Пацев", "avatar": "4.jpg", "valueText": "273 голоса"},
        {"id": 1, "name": "Евгений Дементьев", "avatar": "1.jpg", "valueText": "270 голосов"},
        {"id": 6, "name": "Андрей Мокроусов", "avatar": "6.jpg", "valueText": "264 голоса"},
        {"id": 2, "name": "Александр Шлейко", "avatar": "2.jpg", "valueText": "242 голоса"},
        {"id": 11, "name": "Юрий Фролов", "avatar": "11.jpg", "valueText": "224 голоса"},
        {"id": 9, "name": "Сергей Бережной", "avatar": "9.jpg", "valueText": "219 голосов"},
        {"id": 3, "name": "Дарья Ковалева", "avatar": "3.jpg", "valueText": "216 голосов"},
        {"id": 10, "name": "Яна Берникова", "avatar": "10.jpg", "valueText": "212 голосов"},
        {"id": 12, "name": "Алексей Ярошевич", "avatar": "12.jpg", "valueText": "210 голосов"}
      ]

    const vote: any = DataTemplate.templateVote(subtitle, users)
    expect(vote.alias).toBe("vote")
    expect(vote.data.title).toBe("Самый 🔎 внимательный разработчик")
    expect(vote.data.subtitle).toBe("Последний вагон")
    expect(vote.data.emoji).toBe("🔎")
    expect(vote.data.users.length).toBe(users.length)
});


test('should return leaders slide', () => {

    const subtitle = "Последний вагон"

    const users = [
        {"id": 8, "name": "Александр Иванков", "avatar": "8.jpg", "valueText": "28"},
        {"id": 6, "name": "Андрей Мокроусов", "avatar": "6.jpg", "valueText": "21"},
        {"id": 9, "name": "Сергей Бережной", "avatar": "9.jpg", "valueText": "11"},
        {"id": 5, "name": "Александр Николаичев", "avatar": "5.jpg", "valueText": "7"},
        {"id": 11, "name": "Юрий Фролов", "avatar": "11.jpg", "valueText": "7"},
        {"id": 2, "name": "Александр Шлейко", "avatar": "2.jpg", "valueText": "6"},
        {"id": 4, "name": "Вадим Пацев", "avatar": "4.jpg", "valueText": "6"},
        {"id": 12, "name": "Алексей Ярошевич", "avatar": "12.jpg", "valueText": "5"},
        {"id": 3, "name": "Дарья Ковалева", "avatar": "3.jpg", "valueText": "4"},
        {"id": 10, "name": "Яна Берникова", "avatar": "10.jpg", "valueText": "4"},
        {"id": 7, "name": "Дмитрий Андриянов", "avatar": "7.jpg", "valueText": "3"},
        {"id": 1, "name": "Евгений Дементьев", "avatar": "1.jpg", "valueText": "2"}
    ]

    const leaders: any = DataTemplate.templateLeaders(subtitle, users)
    expect(leaders.alias).toBe("leaders")
    expect(leaders.data.title).toBe("Больше всего коммитов")
    expect(leaders.data.subtitle).toBe("Последний вагон")
    expect(leaders.data.emoji).toBe("👑")
    expect(leaders.data.users.length).toBe(users.length)
});


test('should return chart slide', () => {

    const subtitle = "Феечки на единорогах"

    const values = [
        {"title": "958", "hint": "Февральская лазурь", "value": 460},
        {"title": "959", "hint": "Новый год", "value": 209},
        {"title": "960", "hint": "Новый код", "value": 288},
        {"title": "961", "hint": "Послевкусие", "value": 258},
        {"title": "962", "hint": "С днем мужика!", "value": 152},
        {"title": "963", "hint": "Новый спринт", "value": 249},
        {"title": "964", "hint": "Феечки на единорогах", "value": 249},
        {"title": "965", "hint": "Раздача долгов", "value": 446},
        {"title": "966", "hint": "Три плюс два", "value": 477},
        {"title": "967", "hint": "Майские праздники", "value": 707},
        {"title": "968", "hint": "Следующий", "value": 475},
    ]

    const users = [
        {"id": 8, "name": "Александр Иванков", "avatar": "8.jpg", "valueText": "28"},
        {"id": 6, "name": "Андрей Мокроусов", "avatar": "6.jpg", "valueText": "21"},
        {"id": 9, "name": "Сергей Бережной", "avatar": "9.jpg", "valueText": "11"},
        {"id": 5, "name": "Александр Николаичев", "avatar": "5.jpg", "valueText": "7"},
        {"id": 11, "name": "Юрий Фролов", "avatar": "11.jpg", "valueText": "7"},
        {"id": 2, "name": "Александр Шлейко", "avatar": "2.jpg", "valueText": "6"}
    ]

    const chart: any = DataTemplate.templateChart(subtitle, values, users)

    expect(chart.alias).toBe("chart")
    expect(chart.data.title).toBe("Коммиты")
    expect(chart.data.subtitle).toBe("Феечки на единорогах")
    expect(chart.data.values.length).toBe(values.length)
    expect(chart.data.users.length).toBe(users.length)

});


test('should return diagram slide', () => {

    const subtitle = "Последний вагон"

    const data = {
        current: 104,
        previous: 210,
        categories: [
            {"title": "> 1001 строки", "valueText": "2", "differenceText": "-3"},
            {"title": "501 — 1000 строк", "valueText": "3", "differenceText": "-3"},
            {"title": "101 — 500 строк", "valueText": "13", "differenceText": "-22"},
            {"title": "1 — 100 строк", "valueText": "86", "differenceText": "-78"}
        ]
    }

    const diagram: any = DataTemplate.templateDiagram(subtitle, data)
    expect(diagram.alias).toBe("diagram")
    expect(diagram.data.title).toBe("Размер коммитов")
    expect(diagram.data.subtitle).toBe("Последний вагон")
    expect(diagram.data.totalText).toBe('104 коммита')
    expect(diagram.data.differenceText).toBe('-106 с прошлого спринта')
    expect(diagram.data.categories.length).toBe(4)
    expect(diagram.data.categories).toStrictEqual([
        {"title": "> 1001 строки", "valueText": "2 коммита", "differenceText": "-3 коммита"},
        {"title": "501 — 1000 строк", "valueText": "3 коммита", "differenceText": "-3 коммита"},
        {"title": "101 — 500 строк", "valueText": "13 коммитов", "differenceText": "-22 коммита"},
        {"title": "1 — 100 строк", "valueText": "86 коммитов", "differenceText": "-78 коммитов"}
    ])
});


test('should return activity slide', () => {

    const subtitle = "Последний вагон"

    const data = {
        "sun": [0, 2, 1, 1, 1, 1, 1, 2, 0, 1, 1, 2, 4, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        "mon": [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0],
        "tue": [0, 0, 0, 3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 4, 1, 0, 0],
        "wed": [0, 0, 4, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 2, 0, 0, 0, 3, 1, 1, 1, 1, 1],
        "thu": [0, 0, 6, 2, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
        "fri": [0, 0, 4, 0, 1, 0, 0, 3, 1, 0, 3, 1, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2],
        "sat": [0, 0, 0, 0, 0, 3, 0, 0, 0, 6, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0]
    }

    const activity: any = DataTemplate.templateActivity(subtitle, data)
    expect(activity.alias).toBe("activity")
    expect(activity.data.title).toBe("Коммиты")
    expect(activity.data.subtitle).toBe("Последний вагон")
    expect(activity.data.data).toStrictEqual(data)
});
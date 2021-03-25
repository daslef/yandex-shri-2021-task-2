import { TemplateAlias, DiagramCategory, StoryInterface, ActivityWeek } from './stories'
import { LeaderInterface, User } from './types'


export default class Template {

    static templateLeaders(subtitle: string, users: LeaderInterface[]) {
        return {
            "alias": "leaders" as TemplateAlias,
            "data": {
              "title": "Больше всего коммитов",
              "subtitle": subtitle, // this.currentSprint.name
              "emoji": "👑",
              "users": users
            }
        }
    }

    static templateChart(subtitle: string, commitsData: any[], usersData: any[]) {
        return {
            "alias": "chart" as TemplateAlias,
            "data": {
              "title": "Коммиты",
              "subtitle": subtitle,
              "values": commitsData,
              "users": usersData
            }
        }
    }

    static templateDiagram(subtitle: string, data: any ) {

        const { current, previous, categories } = data
        const difference = current - previous

        return {
            "alias": "diagram" as TemplateAlias,
            "data": {
              "title": "Размер коммитов",
              "subtitle": subtitle,
              "totalText": this.textProcessed(current, 'diagram'),
              "differenceText": `${difference > 0 ? '+' : ''}${difference} с прошлого спринта`,
              "categories": this.textProcessed(categories, 'diagram')
            }
          }
    }

    static templateActivity(subtitle: string, activity: ActivityWeek) {
        return {
            "alias": "activity" as TemplateAlias,
            "data": {
              "title": "Коммиты",
              "subtitle": subtitle,
              "data": activity
            }
          }
    }

    static templateVote(subtitle: string, users: LeaderInterface[]) {
        return {
            "alias": "vote" as TemplateAlias,
            "data": {
              "title": "Самый 🔎 внимательный разработчик",
              "subtitle": subtitle,
              "emoji": "🔎",
              "users": this.textProcessed(users, 'vote')
            }
          }
    }


   static textProcessed(data: (string | number | any[]), template: ('vote'|'diagram')) {

        const wordForms = template === 'vote' ? ['голос', 'голоса', 'голосов']
            : template === 'diagram' ? ['коммит', 'коммита', 'коммитов'] 
            : []

        const postfix = (numeral: any) => {

            let i = Math.abs(Number(numeral)) % 100

            if (i >= 11 && i <= 19) {
                return `${numeral} ${wordForms[2]}`
            }

            i = i % 10
            const postfix = (i == 1) ? wordForms[0] : (i >= 2 && i <= 4) ? wordForms[1] : wordForms[2]
            return `${numeral} ${postfix}`

        } 

        const processDiagramText = (data) => {
            if (!(data instanceof Object)) {
                return postfix(data)
            }

            return data.map(({ title, valueText, differenceText }) => {
                const prefix = Number(differenceText) > 0 ? '+' : ''
                return { 
                    title, 
                    valueText: postfix(valueText),
                    differenceText: prefix.concat(postfix(differenceText))
                }
            })
        }

        const processVoteText = (data) => {
            return data.map(obj => ({ ...obj, valueText: postfix(obj.valueText) }))
        }

        if (template === 'vote') {
           return processVoteText(data)
        } else if (template === 'diagram') {
            return processDiagramText(data)
        }
    }

}
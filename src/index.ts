import Parser from './dataParser'
import Template from './dataTemplate'

import { Entity, SprintId } from './types'

function prepareData(entities: Entity[], { sprintId }: { sprintId: SprintId}) {
    const parser = new Parser(entities, sprintId);
    parser.prepare();

    const subtitle = parser.subtitle

    const vote = Template.templateVote(subtitle, parser.votes)
    const leaders = Template.templateLeaders(subtitle, parser.leaders)
    const chart = Template.templateChart(subtitle, parser.chart, parser.leaders)
    const diagram = Template.templateDiagram(subtitle, parser.diagram)
    const activity = Template.templateActivity(subtitle, parser.activity)

    return [vote, leaders, chart, diagram, activity]

}
module.exports = { prepareData }
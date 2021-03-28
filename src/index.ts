import Parser from './dataParser'
import Template from './dataTemplate'

import { Entity, SprintId } from './types'
import { StoryData } from './stories'

(function(exports) {
   
    function prepareData(entities: Entity[], { sprintId }: { sprintId: SprintId}): StoryData {

        if (entities.length == 0 || sprintId == undefined) {
            return []
        }
    
        const parser = new Parser(entities, sprintId);
        parser.prepare();
    
        const subtitle = parser.subtitle
    
        const vote = Template.templateVote(subtitle, parser.votes)
        const leaders = Template.templateLeaders(subtitle, parser.leaders)
        const chart = Template.templateChart(subtitle, parser.chart, parser.leaders)
        const diagram = Template.templateDiagram(subtitle, parser.diagram)
        const activity = Template.templateActivity(subtitle, parser.activity)
    
        return [leaders, vote, chart, diagram, activity]
    }
       
    exports.prepareData = prepareData;
       
})(typeof exports === 'undefined'? this['sharedModule']={}: exports);

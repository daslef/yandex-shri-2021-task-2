function prepareData(entities, { sprintId }) {
   if (entities.length == 0 || sprintId == undefined) {
      return []
  }

  const vote = {data:[]}
  const leaders = {data:[]}
  const chart = {data:[]}
  const diagram = {data:[]}
  const activity = {data:[]}

  return [leaders, vote, chart, diagram, activity]    
}

module.exports = { prepareData }
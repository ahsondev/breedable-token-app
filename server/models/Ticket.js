module.exports = (connectionSeq, Sequelize) => {
  const Model = connectionSeq.define(
    'Ticket',
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      address: {
        type: Sequelize.STRING,
      },
    },
    {
      tableName: 'tickets',
    }
  )

  return Model
}

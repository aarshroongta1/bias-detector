const categories = [
  {
    name: 'Gendered Language',
    color: 'medium',
    examples: [
      { bad: 'chairman', good: 'chairperson' },
      { bad: 'manpower', good: 'workforce' },
      { bad: 'fireman', good: 'firefighter' }
    ]
  },
  {
    name: 'Age Bias',
    color: 'high',
    examples: [
      { bad: 'young and energetic', good: 'energetic' },
      { bad: 'digital native', good: 'tech-savvy' },
      { bad: 'elderly', good: 'older adults' }
    ]
  },
  {
    name: 'Cultural Assumptions',
    color: 'medium',
    examples: [
      { bad: 'Christmas party', good: 'holiday celebration' },
      { bad: 'normal name', good: 'common name' },
      { bad: 'exotic', good: 'unique' }
    ]
  },
  {
    name: 'Ability Bias',
    color: 'high',
    examples: [
      { bad: 'crippled by', good: 'hindered by' },
      { bad: 'blind to', good: 'unaware of' },
      { bad: 'tone deaf', good: 'insensitive to' }
    ]
  },
  {
    name: 'Socioeconomic Bias',
    color: 'low',
    examples: [
      { bad: 'underprivileged', good: 'under-resourced' },
      { bad: 'inner city', good: 'urban' },
      { bad: 'blue collar', good: 'working class' }
    ]
  },
  {
    name: 'Racial & Ethnic',
    color: 'high',
    examples: [
      { bad: 'articulate (as surprise)', good: 'well-spoken' },
      { bad: 'exotic features', good: 'distinctive features' },
      { bad: 'ethnic food', good: 'international cuisine' }
    ]
  }
]

export default function BiasCategories() {
  return (
    <section className="categories" id="categories">
      <div className="section-header">
        <h2>Bias Categories We Detect</h2>
        <p className="section-subtitle">
          Our AI identifies subtle biases across six key categories
        </p>
      </div>

      <div className="categories-list">
        {categories.map((category, index) => (
          <div key={index} className={`category-row ${category.color}`}>
            <div className="category-header">
              <span className={`category-badge ${category.color}`}>{category.name}</span>
            </div>
            <div className="category-transforms">
              {category.examples.map((ex, i) => (
                <div key={i} className="transform-item">
                  <span className="bad-word">{ex.bad}</span>
                  <span className="arrow">→</span>
                  <span className="good-word">{ex.good}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

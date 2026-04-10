export default function TestPage() {
  return (
    <div className="min-h-screen bg-luxury-pearl py-24">
      <div className="container">
        <h1 className="section-title">Tailwind CSS Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-luxury-gold text-white p-6 rounded-lg">
            <h2 className="text-2xl font-serif mb-2">Luxury Gold</h2>
            <p>This should be gold colored background</p>
          </div>
          
          <div className="bg-luxury-charcoal text-white p-6 rounded-lg">
            <h2 className="text-2xl font-serif mb-2">Charcoal</h2>
            <p>This should be dark charcoal background</p>
          </div>
          
          <div className="bg-luxury-burgundy text-white p-6 rounded-lg">
            <h2 className="text-2xl font-serif mb-2">Burgundy</h2>
            <p>This should be burgundy background</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <button className="btn-primary">Primary Button</button>
          <button className="btn-outline ml-4">Outline Button</button>
          <button className="btn-gold ml-4">Gold Button</button>
        </div>

        <div className="mt-8">
          <input 
            type="text" 
            placeholder="Test input field" 
            className="input-field max-w-md"
          />
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <span className="section-subtitle">Test Subtitle</span>
          <h3 className="text-2xl font-serif mt-1">Card Title</h3>
          <p className="text-gray-600 mt-2">
            This is a test card to verify styling is working correctly.
          </p>
        </div>
      </div>
    </div>
  )
}
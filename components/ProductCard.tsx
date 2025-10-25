export default function ProductCard({ product }: { product: any }) {
  const hasCategories = 
    (product.occasions?.length > 0) || 
    (product.relationships?.length > 0) || 
    (product.age_ranges?.length > 0);

  return (
    <div className="overflow-hidden bg-white">
      {product.image_url && (
        <div className="aspect-video overflow-hidden bg-gray-100">
          <img 
            src={product.image_url} 
            alt={product.name || 'Product image'} 
            className="h-full w-full object-cover" 
          />
        </div>
      )}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
        {product.price && (
          <div className="mt-2 text-3xl font-bold text-blue-600">{product.price}</div>
        )}
        
        {hasCategories && (
          <div className="mt-4 space-y-2">
            {product.occasions?.length > 0 && (
              <div>
                <span className="text-xs font-medium text-gray-500">Occasions: </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {product.occasions.map((occ: string) => (
                    <span key={occ} className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                      {occ}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {product.relationships?.length > 0 && (
              <div>
                <span className="text-xs font-medium text-gray-500">For: </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {product.relationships.map((rel: string) => (
                    <span key={rel} className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                      {rel}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {product.age_ranges?.length > 0 && (
              <div>
                <span className="text-xs font-medium text-gray-500">Age: </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {product.age_ranges.map((age: string) => (
                    <span key={age} className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                      {age}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {product.product_link && (
          <a 
            href={product.product_link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            View Product Details →
          </a>
        )}
      </div>
    </div>
  );
}

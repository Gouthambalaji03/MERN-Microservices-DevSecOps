function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-dark-700 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
    </div>
  )
}

export default Loading


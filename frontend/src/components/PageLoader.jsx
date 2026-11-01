function PageLoader({ message = "Loading..." }) {
    return (
        <div className="p-10 text-center text-sm text-gray-500" role="status">
            {message}
        </div>
    );
}

export default PageLoader;
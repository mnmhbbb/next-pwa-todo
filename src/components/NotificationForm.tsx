interface NotificationFormProps {
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
}

const NotificationForm = ({ onSubmit, isPending }: NotificationFormProps) => {
  return (
    <div className="flex justify-center">
      <form className="bg-white p-8 rounded-lg shadow-md w-80">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
            제목:
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            내용:
          </label>
          <div className="relative">
            <input
              id="description"
              name="description"
              type="text"
              required
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          <button
            formAction={onSubmit}
            disabled={isPending}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
          >
            {isPending ? "전송 중..." : "알림 전송"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationForm;

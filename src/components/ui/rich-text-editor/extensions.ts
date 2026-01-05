import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'

export const extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2],
    },
    bulletList: {
      HTMLAttributes: {
        class: 'list-disc pl-4 space-y-1',
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: 'list-decimal pl-4 space-y-1',
      },
    },
    blockquote: {
      HTMLAttributes: {
        class: 'border-l-4 border-primary pl-4 italic',
      },
    },
    link: {
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary underline cursor-pointer',
      },
    },
  }),
  Image.configure({
    HTMLAttributes: {
      class: 'rounded-lg max-w-full h-auto shadow-md',
    },
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading') {
        return 'What is the title?'
      }
      return 'Type something amazing...'
    },
    includeChildren: true,
  }),
]

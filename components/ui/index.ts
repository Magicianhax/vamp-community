// RetroUI components (primary)
export { Button } from '@/components/retroui/Button'
export type { IButtonProps as ButtonProps } from '@/components/retroui/Button'

export { Input } from '@/components/retroui/Input'
export type { InputProps } from '@/components/retroui/Input'

export { Badge } from '@/components/retroui/Badge'

export { Avatar } from '@/components/retroui/Avatar'

export { Card } from '@/components/retroui/Card'

export { Text } from '@/components/retroui/Text'

export { Alert } from '@/components/retroui/Alert'

export { Accordion } from '@/components/retroui/Accordion'

// Custom components (updated to use RetroUI styling)
export { UpvoteButton } from './UpvoteButton'
export type { UpvoteButtonProps } from './UpvoteButton'

export { DownvoteButton } from './DownvoteButton'
export type { DownvoteButtonProps } from './DownvoteButton'

export { SignInModal } from './SignInModal'
export { SearchModal } from './SearchModal'
export type { SearchModalProps } from './SearchModal'

export { TwitterAvatar } from './TwitterAvatar'
export type { TwitterAvatarProps } from './TwitterAvatar'

export { Markdown } from './Markdown'

// Form components with labels (RetroUI styled)
export { Input as InputWithLabel, Textarea, Select } from './Input'
export type { InputProps as InputWithLabelProps, TextareaProps, SelectProps } from './Input'

// Legacy components
export { Modal, ConfirmModal } from './Modal'
export type { ModalProps, ConfirmModalProps } from './Modal'

export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps } from './Tabs'

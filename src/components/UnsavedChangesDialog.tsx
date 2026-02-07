import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export interface UnsavedChangesDialogProps {
  open: boolean
  isSaving?: boolean
  onCancel: () => void
  onDiscard: () => void
  onSave: () => void
}

export function UnsavedChangesDialog({
  open,
  isSaving = false,
  onCancel,
  onDiscard,
  onSave,
}: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>未保存更改</DialogTitle>
          <DialogDescription>
            检测到当前配置存在未保存更改。切换会导致这些更改丢失。
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            取消
          </Button>
          <Button variant="destructive" onClick={onDiscard} disabled={isSaving}>
            不保存切换
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            保存并切换
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

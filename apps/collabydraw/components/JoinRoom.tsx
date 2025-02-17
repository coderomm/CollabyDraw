import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"

export function JoinRoom() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="glow-effect">
                    Join Room
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel">
                <DialogHeader>
                    <DialogTitle>Join Collaboration Room</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input placeholder="Enter room code" className="glass-panel" />
                    <Button className="glow-effect">Join Room</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
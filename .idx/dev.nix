{ pkgs, ... }: {
  channel = "stable-24.11";
  packages = [ pkgs.python3 ];
  idx.previews.enable = false;
}

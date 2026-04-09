{ pkgs, ... }: {
  channel = "stable-24.11";
  packages = [ pkgs.python3 ];
  idx.previews = {
    enable = true;
    previews = {
      web = {
        command = ["python3" "-m" "http.server" "$PORT"];
        manager = "web";
      };
    };
  };
}

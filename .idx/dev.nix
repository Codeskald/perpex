{ pkgs, ... }: {
  channel = "stable-24.11";

  packages = [];

  idx = {
    workspace = {
      onStart = {};
    };

    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npx" "--yes" "serve" "-l" "$PORT" "."];
          manager = "web";
        };
      };
    };
  };
}
